// importing required packages
const Plans = require("../models/plan.js");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Subscription = require("../models/subscription.js");

const StripePlansIds = {
  mobile: {
    month: "price_1OBseXSERmmQORdUwI7olDvU",
    year: "price_1OBseXSERmmQORdUxm4ESotR",
  },
  basic: {
    month: "price_1OBsfvSERmmQORdUi1e8FBcL",
    year: "price_1OBsfuSERmmQORdUn4PQZqc4",
  },
  standard: {
    month: "price_1OBsgcSERmmQORdUSc0bHTCB",
    year: "price_1OBsgcSERmmQORdUhUBqzzw2",
  },
  premium: {
    month: "price_1OBshDSERmmQORdUJPzpm0KY",
    year: "price_1OBshDSERmmQORdUC6yrbtkR",
  },
};

// @ENDPOINT: /plans/fetch-all-plans
// @METHOD: GET
// @DESCRIPTION: Return plan detials
const fetchAllPlans = (req, res) => {
  Plans.find()
    .then((plans) => res.status(200).json({ success: true, plans: plans[0] }))
    .catch((err) =>
      res.status(500).json({ success: false, message: err.message })
    );
};

// @ENDPOINT: /plans/subscribe
// @METHOD: POST
// @DESCRIPTION: Start The Subscriotion
// @AUTH: Access Token is required
const startSubscription = async (req, res) => {
  const { email, payment_method, planname, period } = req.body;

  const planId = StripePlansIds[planname][period];

  // Create customer with provided email
  const customer = await stripe.customers.create({
    payment_method: payment_method,
    email: email,
    invoice_settings: {
      default_payment_method: payment_method,
    },
  });

  // create subscription linked with created customer
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan: planId }],
    expand: ["latest_invoice.payment_intent"],
  });

  const status = subscription["latest_invoice"]["payment_intent"]["status"];
  const client_secret =
    subscription["latest_invoice"]["payment_intent"]["client_secret"];
  const subsId = subscription["id"];

  res.status(200).json({
    success: true,
    client_secret: client_secret,
    status: status,
    subscriptionId: subsId,
  });
};

// @ENDPOINT: /plans/add-subscription
// @METHOD: POST
// @DESCRIPTION: Add the transaction information in the database
// @AUTH: Access Token is required
const storeSubscriptionInformation = (req, res) => {
  const { planDetails, stripePaymentId, subscriptionId } = req.body;

  const stripePlanId = StripePlansIds[planDetails.plan][planDetails.period];

  let transaction = new Subscription({
    planDetails,
    stripePlanId,
    user: req.user.id,
    stripePaymentId,
    subscriptionId,
  });

  transaction
    .save()
    .then((result) =>
      res
        .status(200)
        .json({ success: true, message: "Trasaction Added Successfully" })
    )
    .catch((err) =>
      res.status(500).json({
        success: false,
        message: err.message,
      })
    );
};

// @ENDPOINT: /plans/subscriptions
// @METHOD: GET
// @DESCRIPTION: Return all the transaction of the current user
// @AUTH: Access Token is required
const getAllSubscriptions = (req, res) => {
  Subscription.find({ user: req.user.id })
    .then((trans) =>
      res.status(200).json({ success: true, subscriptions: trans })
    )
    .catch((err) =>
      res.status(500).json({ success: false, message: err.message })
    );
};

// @ENDPOINT: /plans/cancel
// @METHOD: POST
// @DESCRIPTION: Cancel the Subscription
// @AUTH: Access Token is required
const cancelSubscription = (req, res) => {
  const subscriptionId = req.params.subsId;

  // find the subscription of given user with given subscriptionId
  Subscription.findOne({ user: req.user.id, subscriptionId })
    .then(async (subs) => {
      try {
        // Retrieve subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );

        // Check if the subscription is already canceled
        if (subscription.status === "canceled") {
          return res.status(400).json({
            success: false,
            message: "Subscription is already canceled.",
          });
        }

        // Cancel the subscription
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });

        // if everything is fine then update the database also

        subs.active = false;
        await subs.save();
        return res.json({
          success: true,
          message: "Subscription cancellation scheduled.",
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "An error occurred while canceling the subscription.",
        });
      }
    })
    .catch((err) =>
      res.status(500).json({ success: false, message: err.message })
    );
};

module.exports = {
  fetchAllPlans,
  startSubscription,
  storeSubscriptionInformation,
  getAllSubscriptions,
  cancelSubscription,
};

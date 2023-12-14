const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  basic: {
    "Monthly-Price": Number,
    "Number-of-active-screens-at-one-time": Number,
    Resolution: String,
    "Video-Quality": String,
    "Yearly-Price": Number,
  },
  premium: {
    "Monthly-Price": Number,
    "Number-of-active-screens-at-one-time": Number,
    Resolution: String,
    "Video-Quality": String,
    "Yearly-Price": Number,
  },
  mobile: {
    "Monthly-Price": Number,
    "Number-of-active-screens-at-one-time": Number,
    Resolution: String,
    "Video-Quality": String,
    "Yearly-Price": Number,
  },
  standard: {
    "Monthly-Price": Number,
    "Number-of-active-screens-at-one-time": Number,
    Resolution: String,
    "Video-Quality": String,
    "Yearly-Price": Number,
  },
});

module.exports = mongoose.model("richpanelplans", planSchema);

const user = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exitingUser = await user.findOne({ email });

    if (exitingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    // secure password
    let hashPassword;
    try {
      hashPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error in hashing password" + error,
      });
    }
    const userData = await user.create({
      name,
      email,
      password: hashPassword,
      role,
    });

    res.status(200).json({
      success: true,
      data: userData,
      message: "your account creating successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "internal error",
    });
  }
};

require("dotenv").config();
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation of email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the details carefully",
      });
    }
    let userData = await user.findOne({ email });

    // check user email Register or not
    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "Your email is incorrect, Please fill exist email",
      });
    }
    const payload = {
      email: userData.email,
      id: userData.id,
      role: userData.role,
    };
    if (await bcrypt.compare(password, userData.password)) {
      // password match
      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      userData = userData.toObject();
      userData.token = token;
      userData.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.cookie("tokenCookie", token, options).status(200).json({
        success: true,
        userData,
        token,
        name: userData.name,
        message: "User logged in successfully",
      });
    } else {
      // password do not match
      return res.status(430).json({
        success: false,
        message: "Password Incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "internal error",
    });
  }
};

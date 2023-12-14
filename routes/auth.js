// importing required packages
const express = require("express");
const route = express.Router();
// const {body} = require("express-validator")

// // importing controllors
const { signup, login } = require("../controllers/auth");

route.post("/signup", signup);
route.post("/login", login);

module.exports = route;

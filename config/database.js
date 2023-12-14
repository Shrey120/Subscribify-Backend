const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = () => {
  mongoose
    .connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Database connection successfully"))
    .catch((error) => {
      console.log("Database connection failure !!", error);
      process.exit(1);
    });
};

module.exports = connectDB;

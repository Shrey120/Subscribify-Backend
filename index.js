const express = require("express");
const app = express();
const route = require("./routes/auth");
const router = require("./routes/plans");
const cors = require("cors");
const dbConnect = require("./config/database");
app.use(cors());
require("dotenv").config();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(route);
app.use("/plans", router);

app.listen(PORT, () => {
  console.log(`Server listen on port ${PORT}`);
});
dbConnect();

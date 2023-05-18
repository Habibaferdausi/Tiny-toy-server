const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
//require("dotenv").config();
//middle

app.get("/", (req, res) => {
  res.send("connected");
});
app.listen(5000, () => {
  console.log("server is running on port 5000");
});

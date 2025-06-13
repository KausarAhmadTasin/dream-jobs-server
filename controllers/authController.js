const jwt = require("jsonwebtoken");
const { cookieOptions } = require("../middlewares/authMiddleware");
require("dotenv").config();

exports.generateToken = async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res.cookie("token", token, cookieOptions).send({ success: true });
};

exports.logout = async (req, res) => {
  res
    .clearCookie("token", { ...cookieOptions, maxAge: 0 })
    .send({ success: true });
};

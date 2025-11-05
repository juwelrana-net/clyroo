// server/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
  // Header se token lein
  const token = req.header("x-auth-token");

  // Check karein ki token hai ya nahi
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Token ko verify karein
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

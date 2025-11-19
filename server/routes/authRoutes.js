// server/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // <--- 1. Crypto Import kiya (Token generate karne ke liye)
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail"); // <--- 2. Email utility import kiya
const multerUpload = require("../middleware/multerUpload");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
// Frontend ka URL (Development ya Production ke hisaab se set karein)
// Agar .env mein nahi hai toh default localhost maan lete hain
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ROUTE 1: Register Admin (Same as before)
router.post("/register", multerUpload, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ msg: "Please enter all fields (Name, Email, Password)" });
  }

  try {
    const adminCount = await User.countDocuments();
    if (adminCount > 0) {
      if (req.file) {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res
        .status(403)
        .json({ msg: "Registration is closed. An admin already exists." });
    }

    let user = await User.findOne({ email });
    if (user) {
      if (req.file) {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({ msg: "User already exists" });
    }

    const superAdminPermissions = {
      manageProducts: true,
      manageStock: true,
      managePayments: true,
      manageCategories: true,
      manageContacts: true,
      manageNotifications: true,
      manageAdmins: true,
    };

    user = new User({
      name: name,
      email: email,
      password: password,
      profileImageUrl: req.file ? req.file.path : "",
      profileImageCloudinaryId: req.file ? req.file.filename : "",
      permissions: superAdminPermissions,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ROUTE 2: Login Admin (Same as before)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ROUTE 3: Check Registration Status (Same as before)
router.get("/registration-status", async (req, res) => {
  try {
    const adminCount = await User.countDocuments();
    res.json({ allowRegistration: adminCount === 0 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// --- NAYA ROUTE: FORGOT PASSWORD ---
router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Security: Agar email nahi mila, tab bhi hum success message hi dikhayenge
      // taaki hacker ko pata na chale ki yeh email register hai ya nahi.
      return res.status(200).json({ msg: "Email sent" });
    }

    // Token Generate Karein
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Token ko Hash karke DB mein save karein (Raw token email mein jayega)
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token 10 minute mein expire ho jayega
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Reset URL banayein (Frontend ka link)
    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    try {
      await sendEmail(user.email, "Password Reset Request", message);
      res.status(200).json({ msg: "Email sent" });
    } catch (err) {
      console.error("Email sending failed:", err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ msg: "Email could not be sent" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// --- NAYA ROUTE: RESET PASSWORD ---
router.put("/resetpassword/:resetToken", async (req, res) => {
  // URL se token lein aur hash karein (kyunki DB mein hashed hai)
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    // Aisa user dhundhein jiska token match kare aur waqt baaki ho ($gt = greater than)
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or Expired Token" });
    }

    // Naya password set karein
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Reset fields ko saaf kar dein
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Login ke liye naya JWT token bhej dein (Optional, user ko direct dashboard bhej sakte hain)
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      res.json({ success: true, token, msg: "Password updated successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

// server/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// --- YEH NAYA IMPORT ADD KAREIN ---
// Humara banaya hua file upload middleware
const multerUpload = require("../middleware/multerUpload");
// --- NAYA IMPORT KHATAM ---

// ENV se JWT_SECRET lene ke liye
const JWT_SECRET = process.env.JWT_SECRET;

// --- YEH POORA ROUTE UPDATE HO GAYA HAI ---
// ROUTE 1: Register Admin (Signup)
// POST /api/auth/register
// multerUpload ko hum middleware ki tarah request handler se pehle daal denge
router.post("/register", multerUpload, async (req, res) => {
  // Ab hum 'name', 'email', 'password' ko body se lenge
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ msg: "Please enter all fields (Name, Email, Password)" });
  }

  // Check karein ki file upload hui ya nahi (optional hai)
  if (!req.file) {
    console.log("Warning: No profile image uploaded for new user.");
    // Hum register fail nahi karenge, bas image empty rahegi
  }

  try {
    // 1. Check karein ki user pehle se hai
    let user = await User.findOne({ email });
    if (user) {
      // Agar user pehle se hai, toh Cloudinary par upload hui image ko delete kar dein
      // (Yeh ek achha practice hai)
      if (req.file) {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({ msg: "User already exists" });
    }

    // 2. Naya user banayein
    user = new User({
      name: name, // Naya field
      email: email,
      password: password,
      // req.file se image ka URL aur ID save karein (agar file hai)
      profileImageUrl: req.file ? req.file.path : "",
      profileImageCloudinaryId: req.file ? req.file.filename : "",
    });

    // 3. Password ko hash karein
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. User ko save karein
    await user.save();

    // 5. Token banayein aur return karein
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
// --- REGISTER ROUTE KHATAM HUA ---

// --- LOGIN ROUTE (Waisa hi rahega) ---
// ROUTE 2: Login Admin (Signin)
// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    // 1. User ko dhundhein
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // 2. Password compare karein
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // 3. Token banayein aur return karein
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

module.exports = router;

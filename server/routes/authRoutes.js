// server/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const multerUpload = require("../middleware/multerUpload");

const JWT_SECRET = process.env.JWT_SECRET;

// --- YEH POORA ROUTE UPDATE HO GAYA HAI ---
// ROUTE 1: Register Admin (Signup)
router.post("/register", multerUpload, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ msg: "Please enter all fields (Name, Email, Password)" });
  }

  try {
    // --- NAYA CHECK ---
    // Check karein ki database mein pehle se koi user hai ya nahi
    const adminCount = await User.countDocuments();
    if (adminCount > 0) {
      // Agar pehle se admin hain, toh public registration ko block kar dein
      // Agar user ne image upload ki thi, toh usse delete kar dein
      if (req.file) {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res
        .status(403) // 403 Forbidden
        .json({ msg: "Registration is closed. An admin already exists." });
    }
    // --- CHECK KHATAM ---

    let user = await User.findOne({ email });
    if (user) {
      if (req.file) {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({ msg: "User already exists" });
    }

    // --- NAYA PERMISSION OBJECT ---
    // Kyunki yeh pehla admin hai (adminCount === 0), isse saare permissions de dein
    const superAdminPermissions = {
      manageProducts: true,
      manageStock: true,
      managePayments: true,
      manageCategories: true,
      manageContacts: true,
      manageNotifications: true,
      manageAdmins: true,
    };
    // --- PERMISSION OBJECT KHATAM ---

    user = new User({
      name: name,
      email: email,
      password: password,
      profileImageUrl: req.file ? req.file.path : "",
      profileImageCloudinaryId: req.file ? req.file.filename : "",
      permissions: superAdminPermissions, // <-- Naye permissions yahaan set karein
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

// ROUTE 2: Login Admin (Signin) - (Ismein koi change nahi hai)
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

// --- YEH NAYA ROUTE ADD HUA HAI ---
// ROUTE 3: Check Registration Status (Public)
// Yeh frontend ko batayega ki register page dikhana hai ya nahi
router.get("/registration-status", async (req, res) => {
  try {
    const adminCount = await User.countDocuments();
    // Agar 0 admin hain, tabhi registration allowed hai
    res.json({ allowRegistration: adminCount === 0 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
// --- NAYA ROUTE KHATAM ---

module.exports = router;

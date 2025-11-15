// server/routes/profileRoutes.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const multerUpload = require("../middleware/multerUpload"); // Image upload ke liye
// const cloudinary = require("../config/cloudinary");

// --- ROUTE 1: Get Current Admin Details ---
// (Navbar mein profile image dikhaane ke liye)
// GET /api/profile/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // authMiddleware ne req.user.id set kar diya hai
    // Hum password chhodkar baaki sab bhej denge
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- ROUTE 2: Update Admin Profile ---
// (Name, Email, Password, ya Image update karne ke liye)
// PUT /api/profile/update
router.put("/update", [authMiddleware, multerUpload], async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.user.id;

  const cloudinary = require("../config/cloudinary");

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 1. Text fields update karein (Name, Email)
    if (name) user.name = name;
    if (email) user.email = email; // (Email update karna risky ho sakta hai, par hum option de rahe hain)

    // 2. Password update karein (agar naya password bheja gaya hai)
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // 3. Profile Image update karein (agar nayi file upload hui hai)
    if (req.file) {
      // Check karein ki puraani image Cloudinary par hai ya nahi
      if (user.profileImageCloudinaryId) {
        // Puraani image ko Cloudinary se delete kar dein
        await cloudinary.uploader.destroy(user.profileImageCloudinaryId);
      }
      // Nayi image ka URL aur ID save karein
      user.profileImageUrl = req.file.path;
      user.profileImageCloudinaryId = req.file.filename;
    }

    // 4. Sab changes ko save karein
    await user.save();

    // Updated user data (bina password ke) wapas bhejein
    const updatedUser = await User.findById(userId).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    // Agar email duplicate hai toh error aayega
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Email already exists." });
    }
    res.status(500).send("Server Error");
  }
});

// --- ROUTE 3: Delete Admin Account ---
// DELETE /api/profile/delete
router.delete("/delete", authMiddleware, async (req, res) => {
  const cloudinary = require("../config/cloudinary");

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 1. Cloudinary se image delete karein (agar hai)
    if (user.profileImageCloudinaryId) {
      await cloudinary.uploader.destroy(user.profileImageCloudinaryId);
    }

    // 2. Database se user ko delete karein
    await user.deleteOne(); // .remove() deprecated hai

    // TODO: Us user se jude AdminDevice tokens ko bhi delete karna chahiye
    // (Abhi ke liye yeh kaafi hai)

    res.json({ msg: "Admin account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

// server/routes/profileRoutes.js

// --- YEH NAYI LINE ADD KAREIN ---
console.log(">>> [SERVER] profileRoutes.js (v2 - Cloudinary Fix) file loaded.");
// --- NAYI LINE KHATAM ---

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const multerUpload = require("../middleware/multerUpload");

// --- ROUTE 1: Get Current Admin Details ---
router.get("/me", authMiddleware, async (req, res) => {
  try {
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
router.put("/update", [authMiddleware, multerUpload], async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.user.id;
  const cloudinary = require("../config/cloudinary"); // Import ko andar rakhein

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      // YEH HAI POORA SAFETY CHECK
      if (
        user.profileImageCloudinaryId &&
        typeof user.profileImageCloudinaryId === "string" &&
        user.profileImageCloudinaryId.length > 0
      ) {
        try {
          await cloudinary.uploader.destroy(user.profileImageCloudinaryId);
        } catch (destroyErr) {
          console.error(
            "Cloudinary delete error (non-fatal):",
            destroyErr.message
          );
          // Is error ko ignore karein aur aage badhein
        }
      }
      user.profileImageUrl = req.file.path;
      user.profileImageCloudinaryId = req.file.filename;
    }

    await user.save();
    const updatedUser = await User.findById(userId).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error("Profile update error:", err.message);
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Email already exists." });
    }
    res.status(500).send("Server Error");
  }
});

// --- ROUTE 3: Delete Admin Account (FIXED) ---
router.delete("/delete", authMiddleware, async (req, res) => {
  const cloudinary = require("../config/cloudinary"); // Import ko andar rakhein

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // YEH BHI HAI POORA SAFETY CHECK
    if (
      user.profileImageCloudinaryId &&
      typeof user.profileImageCloudinaryId === "string" &&
      user.profileImageCloudinaryId.length > 0
    ) {
      try {
        await cloudinary.uploader.destroy(user.profileImageCloudinaryId);
      } catch (destroyErr) {
        console.error(
          "Cloudinary delete error (non-fatal):",
          destroyErr.message
        );
      }
    }

    await user.deleteOne();
    res.json({ msg: "Admin account deleted successfully" });
  } catch (err) {
    console.error("Profile delete error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

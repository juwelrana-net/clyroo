// server/routes/profileRoutes.js

console.log(
  ">>> [SERVER] profileRoutes.js (v3 - SuperAdmin Lock) file loaded."
);

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const multerUpload = require("../middleware/multerUpload");

// --- NAYA MIDDLEWARE IMPORT ---
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

// --- ROUTE 1: Get Current Admin Details ---
// Yeh route aam admin bhi use kar sakta hai (sirf data dekhne ke liye)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user); // isSuperAdmin virtual yahaan aa jaayega
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- ROUTE 2: Update Admin Profile (SIRF SUPER ADMIN) ---
// Pehle auth check hoga, fir super admin check hoga
router.put(
  "/update",
  [authMiddleware, superAdminMiddleware, multerUpload],
  async (req, res) => {
    // Ab humein pata hai ki yeh user Super Admin hai
    const { name, email, password } = req.body;
    const userId = req.user.id; // Yeh super admin ki apni ID hai
    const cloudinary = require("../config/cloudinary");

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
        if (
          user.profileImageCloudinaryId &&
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
  }
);

// --- ROUTE 3: Delete Admin Account (SIRF SUPER ADMIN) ---
router.delete(
  "/delete",
  [authMiddleware, superAdminMiddleware],
  async (req, res) => {
    const cloudinary = require("../config/cloudinary");

    try {
      const user = await User.findById(req.user.id); // Yeh super admin ki apni ID hai
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (
        user.profileImageCloudinaryId &&
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
  }
);

module.exports = router;

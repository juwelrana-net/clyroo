// server/routes/adminControlRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");
const multerUpload = require("../middleware/multerUpload"); // Image upload ke liye

// Saare routes Super Admin only hain
router.use(authMiddleware, superAdminMiddleware);

// --- ROUTE 1: Get all admins (Super Admin) ---
// GET /api/admin-control
router.get("/", async (req, res) => {
  try {
    // Saare users fetch karein, password mat bhejein
    // Jo user request kar raha hai, usse list se hata dein
    const admins = await User.find({ _id: { $ne: req.user.id } }).select(
      "-password"
    );
    res.json(admins);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- ROUTE 2: Create a new admin (Super Admin) ---
// POST /api/admin-control
router.post("/", multerUpload, async (req, res) => {
  const { name, email, password, permissions } = req.body;

  if (!name || !email || !password || !permissions) {
    return res.status(400).json({ msg: "Please provide all fields" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ msg: "Admin with this email already exists" });
    }

    // 'permissions' ek JSON string ki tarah aa raha hai, usse parse karein
    let parsedPermissions;
    try {
      parsedPermissions = JSON.parse(permissions);
    } catch (e) {
      return res.status(400).json({ msg: "Invalid permissions format" });
    }

    user = new User({
      name,
      email,
      password,
      permissions: parsedPermissions,
      profileImageUrl: req.file ? req.file.path : "",
      profileImageCloudinaryId: req.file ? req.file.filename : "",
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const finalUser = user.toObject(); // .toObject() taaki virtuals (isSuperAdmin) bhi aaye
    delete finalUser.password; // Password hata dein
    res.status(201).json(finalUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- ROUTE 3: Update an admin (Super Admin) ---
// PUT /api/admin-control/:id
router.put("/:id", multerUpload, async (req, res) => {
  const { name, email, password, permissions } = req.body;
  const adminId = req.params.id;
  const cloudinary = require("../config/cloudinary");

  try {
    let user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    // Fields update karein
    if (name) user.name = name;
    if (email) user.email = email;

    // 'permissions' ek JSON string ki tarah aa raha hai, usse parse karein
    if (permissions) {
      try {
        user.permissions = JSON.parse(permissions);
      } catch (e) {
        return res.status(400).json({ msg: "Invalid permissions format" });
      }
    }

    // Agar naya password bheja hai, toh usse hash karke update karein
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Agar nayi image aayi hai, toh puraani delete karein aur nayi set karein
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

    const finalUser = user.toObject();
    delete finalUser.password;
    res.json(finalUser);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Email already exists." });
    }
    res.status(500).send("Server Error");
  }
});

// --- ROUTE 4: Delete an admin (Super Admin) ---
// DELETE /api/admin-control/:id
router.delete("/:id", async (req, res) => {
  const adminId = req.params.id;
  const cloudinary = require("../config/cloudinary");

  try {
    const user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    // Agar admin ki profile image hai, toh usse Cloudinary se delete karein
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

    // Admin ko database se delete karein
    await user.deleteOne();
    res.json({ msg: "Admin account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

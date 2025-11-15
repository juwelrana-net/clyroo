// server/middleware/multerUpload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloudinary par storage engine banayein
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "clyroo_admin_profiles", // Cloudinary mein is naam ka folder ban jaayega
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    // Tasveer ko upload karte hi 500x500 mein crop kar dega
    transformation: [
      { width: 500, height: 500, crop: "fill", gravity: "face" },
    ],
  },
});

// Multer ko storage engine ke saath configure karein
const parser = multer({ storage: storage });

// 'profileImage' naam ke field ko upload karega
module.exports = parser.single("profileImage");

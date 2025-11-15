// server/middleware/superAdminMiddleware.js
const User = require("../models/User");

// Yeh middleware hamesha 'authMiddleware' ke BAAD chalna chahiye
module.exports = async function (req, res, next) {
  try {
    // req.user.id humein 'authMiddleware' se mila hai
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Humara 'isSuperAdmin' virtual property check karein
    if (!user.isSuperAdmin) {
      return res
        .status(403) // 403 Forbidden
        .json({ msg: "Access denied. Requires Super Admin privileges." });
    }

    // Agar user Super Admin hai, toh request ko aage badhne dein
    next();
  } catch (err) {
    console.error("Super Admin middleware error:", err.message);
    res.status(501).json({ msg: "Server Error" });
  }
};

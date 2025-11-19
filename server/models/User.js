// server/models/User.js

const mongoose = require("mongoose");

// Permissions Schema (Waisa hi rahega)
const permissionsSchema = new mongoose.Schema(
  {
    manageProducts: { type: Boolean, default: false },
    manageStock: { type: Boolean, default: false },
    managePayments: { type: Boolean, default: false },
    manageCategories: { type: Boolean, default: false },
    manageContacts: { type: Boolean, default: false },
    manageNotifications: { type: Boolean, default: false },
    manageAdmins: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: "",
    },
    profileImageCloudinaryId: {
      type: String,
    },
    permissions: {
      type: permissionsSchema,
      default: () => ({}),
    },
    // Password reset token store karne ke liye
    resetPasswordToken: {
      type: String,
    },
    // Token kab expire hoga (security ke liye)
    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.virtual("isSuperAdmin").get(function () {
  if (!this.permissions) {
    return false;
  }
  const allPermissions = [
    "manageProducts",
    "manageStock",
    "managePayments",
    "manageCategories",
    "manageContacts",
    "manageNotifications",
    "manageAdmins",
  ];
  return allPermissions.every((perm) => this.permissions[perm] === true);
});

module.exports = mongoose.model("User", UserSchema);

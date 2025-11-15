// server/models/User.js

const mongoose = require("mongoose");

// Yeh naya object humare saare permissions ko define karega
const permissionsSchema = new mongoose.Schema(
  {
    manageProducts: { type: Boolean, default: false },
    manageStock: { type: Boolean, default: false },
    managePayments: { type: Boolean, default: false },
    manageCategories: { type: Boolean, default: false },
    manageContacts: { type: Boolean, default: false },
    manageNotifications: { type: Boolean, default: false },
    manageAdmins: { type: Boolean, default: false }, // Naya permission
  },
  { _id: false } // Iska alag se _id nahi banega
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
    // --- YEH NAYA FIELD ADD HUA HAI ---
    // Har user ke paas ab permissions ka ek set hoga
    permissions: {
      type: permissionsSchema,
      // Default mein, naye user ke paas koi permission nahi hoga
      // (Lekin pehla admin register karte waqt hum isse override karenge)
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    // --- YEH NAYA OBJECT ADD HUA HAI ---
    // 'virtuals: true' zaroori hai taaki virtual fields JSON mein dikhein
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- YEH NAYA VIRTUAL FIELD ADD HUA HAI ---
// 'isSuperAdmin' ek virtual property hai jo check karti hai ki
// user ke paas saare permissions 'true' hain ya nahi.
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
  // 'every' check karega ki array ki har permission user ke paas 'true' hai
  return allPermissions.every((perm) => this.permissions[perm] === true);
});

module.exports = mongoose.model("User", UserSchema);

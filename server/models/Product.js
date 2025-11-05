// server/models/Product.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    // --- YEH NAYA BLOCK ADD HUA HAI ---
    // Yahaan hum define karenge ki is product ke liye
    // kaun se credential fields zaroori hain
    credentialFields: {
      type: [String],
      default: [], // e.g., ["Email", "Password", "Username"]
    },
    // --- NAYA BLOCK KHATAM ---
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

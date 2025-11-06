// server/models/CryptoPayment.js

const mongoose = require("mongoose");

const CryptoPaymentSchema = new mongoose.Schema(
  {
    // Yeh UI par dikhega, e.g., "USDT (TRC20)"
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Yeh humara main logic hai: 'nowpayments' (automatic) ya 'manual'
    type: {
      type: String,
      enum: ["nowpayments", "manual"],
      required: true,
    },
    // NOWPayments ke liye API code, e.g., "usdterc20"
    apiCode: {
      type: String,
      trim: true,
    },
    // Manual payment ke liye aapka static wallet address
    walletAddress: {
      type: String,
      trim: true,
    },
    // Icon ka URL, e.g., "/images/coins/usdt_trc20.svg"
    iconUrl: {
      type: String,
      trim: true,
    },
    // Admin toggle ke liye
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CryptoPayment", CryptoPaymentSchema);

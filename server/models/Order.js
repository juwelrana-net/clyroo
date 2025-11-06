// server/models/Order.js

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Awaiting-Payment",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
    paymentGateway: {
      type: String,
    },
    gatewayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Yahaan hum deliver kiye gaye saare credentials ka reference save karenge
    deliveredCredentials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Credential",
      },
    ],
    // Ek unique, secret token jo sirf customer ko pata hoga
    customerAccessToken: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);

// server/models/Credential.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const credentialSchema = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // --- YEH BLOCK UPDATE HUA HAI ---
    // Ab yeh ek flexible object store karega
    // e.g., { "Email": "user@gmail.com", "Password": "123" }
    credentialData: {
      type: Map,
      of: String,
      required: true,
    },
    // --- UPDATE KHATAM ---
    isSold: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Credential = mongoose.model("Credential", credentialSchema);

module.exports = Credential;

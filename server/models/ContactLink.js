// server/models/ContactLink.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactLinkSchema = new Schema(
  {
    // type batayega ki yeh 'whatsapp' hai ya 'telegram'
    type: {
      type: String,
      enum: ["whatsapp", "telegram"],
      required: true,
    },
    // Yeh number (e.g., 91123...) ya username (e.g., my_user) hoga
    value: {
      type: String,
      required: true,
      trim: true,
    },
    // Yeh button par dikhne wala text hoga (e.g., "Support Team 1")
    displayText: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ContactLink = mongoose.model("ContactLink", contactLinkSchema);

module.exports = ContactLink;

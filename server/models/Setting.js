// server/models/Setting.js

const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
  // key ek unique naam hoga, jaise "binancePayEnabled"
  key: {
    type: String,
    required: true,
    unique: true,
  },
  // value (e.g., "true" ya "false")
  value: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Setting", SettingSchema);

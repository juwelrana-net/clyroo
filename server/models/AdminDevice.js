// server/models/AdminDevice.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Yeh schema admin ke devices ke notification tokens ko store karega
const adminDeviceSchema = new Schema(
  {
    // Yeh "User" model se admin ki ID hai
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Yeh Firebase se mila unique device token hai
    fcmToken: {
      type: String,
      required: true,
      unique: true, // Har token unique hona chahiye
    },
  },
  {
    timestamps: true, // Taaki hum puraane tokens ko baad mein hata sakein
  }
);

const AdminDevice = mongoose.model("AdminDevice", adminDeviceSchema);

module.exports = AdminDevice;

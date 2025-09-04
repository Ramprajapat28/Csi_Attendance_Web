const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QRCode",
    required: true,
  },
  type: {
    type: String,
    enum: ["check-in", "check-out"],
    required: true,
  },
  // timestamp: {
  //   type: Date,
  //   default: Date.now,
  // },
  newDate:{

    type: Date,
    default: () => {
      const now = new Date();
      // Offset IST: UTC + 5 hours 30 minutes
      const istOffset = 5.5 * 60 * 60 * 1000; // milliseconds
      return new Date(now.getTime() + istOffset);
    }
  },


  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    accuracy: Number,
  },
  deviceInfo: {
    deviceId: String,
    platform: String,
    userAgent: String,
    ipAddress: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationDetails: {
    locationMatch: Boolean,
    qrCodeValid: Boolean,
    deviceTrusted: Boolean,
    spoofingDetected: Boolean,
  },
  notes: String,
 },
  // { timestamps: true }
);



module.exports = mongoose.model("Attendance", attendanceSchema);
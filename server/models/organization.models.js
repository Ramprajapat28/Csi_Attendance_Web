const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    location: {
      latitude: { type: Number, default: 19.076 },
      longitude: { type: Number, default: 72.8777 },
      radius: { type: Number, default: 100 },
    },
    settings: {
      timezone: { type: String, default: "UTC" },
      qrCodeValidityMinutes: { type: Number, default: 30 },
      locationToleranceMeters: { type: Number, default: 50 },
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    checkInQRCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRCode",
    },
    checkOutQRCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRCode",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);

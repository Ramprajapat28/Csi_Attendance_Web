const Attendance = require("../models/Attendance.models");
const QRCode = require("../models/Qrcode.models");
const Organization = require("../models/organization.models");
const geolib = require("geolib")
const {isLocationWithin} = require("../utils/locationVerifier")


exports.scanQRCode = async (req, res) => {
  try {
    const { code, location, type, deviceInfo } = req.body;
    const user = req.user;

    // Validate required fields
    if (!code || !location || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const qr = await QRCode.findOne({ code, active: true });
    if (!qr) {
      return res.status(400).json({ message: "Invalid or expired QR code" });
    }

    const now = Date.now();
   

    const org = await Organization.findById(qr.organizationId);
    if (!org) {
      return res.status(400).json({ message: "Organization not found" });
    }

    if (String(user.organizationId) !== String(org._id)) {
      return res.status(403).json({ message: "User not in this organization" });
    }

    const permitted = isLocationWithin(
      org.location,
      location,
      org.settings.locationToleranceMeters || 50
    );

    if (!permitted) {
      return res.status(400).json({
        message: "Location does not match organization",
        locationMatch: false,
      });
    }

    const record = await Attendance.create({
      userId: user._id,
      organizationId: org._id,
      qrCodeId: qr._id,
      type,
      timestamp: new Date(),
      location,
      deviceInfo,
      verified: permitted,
      verificationDetails: {
        locationMatch: permitted,
        qrCodeValid: true,
        timeValid: true,
        deviceTrusted: true,
        spoofingDetected: false,
      },
    });

    // qr.usageCount += 1;
    await qr.save();

    return res.json({ message: "Attendance recorded", attendance: record });
  } catch (error) {
    console.error("Error in scanQRCode:", error);
    return res.status(500).json({ message: "Failed to process scan" });
  }
};
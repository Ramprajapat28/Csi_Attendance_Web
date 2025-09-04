const Attendance = require("../models/Attendance.models");
const QRCode = require("../models/Qrcode.models");
const Organization = require("../models/organization.models");
const geolib = require("geolib");
const { isLocationWithin } = require("../utils/locationVerifier");

exports.getUserPastAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const records = await Attendance.find({
      userId,
      timestamp: { $gte: oneMonthAgo },
    }).sort({ timestamp: -1 });

    res.json({ records });
  } catch (error) {
    console.error("Error fetching user attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
};

exports.scanQRCode = async (req, res) => {
  try {
    const { code, location, type, deviceInfo } = req.body;
    const user = req.user;

    // Validate required fields
    if (!code || !type) {
      return res
        .status(400)
        .json({ message: "Missing required fields: code and type" });
    }

    // Find QR code
    const qr = await QRCode.findOne({ code, active: true });
    if (!qr) {
      return res.status(400).json({ message: "Invalid or expired QR code" });
    }

    // Find organization
    const org = await Organization.findById(qr.organizationId);
    if (!org) {
      return res.status(400).json({ message: "Organization not found" });
    }

    if (!user.organizationId) {
      return res
        .status(403)
        .json({ message: "User not assigned to any organization" });
    }

    // Check organization match
    if (String(user.organizationId) !== String(qr.organizationId)) {
      return res.status(403).json({ message: "User not in this organization" });
    }

    // By default, if location or deviceInfo is not provided, use empty or default values
    const safeLocation =
      location && location.latitude && location.longitude
        ? location
        : { latitude: 0, longitude: 0, accuracy: 0 };
    const safeDeviceInfo = deviceInfo || {};

    // Create attendance record safely without forcing deviceId or location fields
    const record = await Attendance.create({
      userId: user._id,
      organizationId: org._id,
      qrCodeId: qr._id,
      type,
      timestamp: new Date(),
      location: safeLocation,
      deviceInfo: safeDeviceInfo,
      // timestamp: new Date(),
      location: location || { latitude: 0, longitude: 0, accuracy: 0 },
      deviceInfo: deviceInfo || {},
      verified: true,
      verificationDetails: {
        locationMatch: true,
        qrCodeValid: true,
        timeValid: true,
        deviceTrusted: true,
        spoofingDetected: false,
      },
    });

    // Update QR usage count
    qr.usageCount += 1;
    await qr.save();

    return res.json({
      message: "Attendance recorded successfully",
      attendance: record,
      debug: {
        user: user.name,
        organization: org.name,
        type: type,
        // timestamp: record.timestamp,
      },
    });
  } catch (error) {
    console.error("Error in scanQRCode:", error);
    return res.status(500).json({
      message: "Failed to process scan",
      error: error.message,
    });
  }
};

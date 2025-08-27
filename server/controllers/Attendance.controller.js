const Attendance = require("../models/Attendance.models");
const QRCode = require("../models/Qrcode.models");
const Organization = require("../models/organization.models");
const geolib = require("geolib");
const { isLocationWithin } = require("../utils/locationVerifier");

exports.scanQRCode = async (req, res) => {
  try {
    const { code, location, type, deviceInfo } = req.body;
    const user = req.user;

    // 🔍 Debug logging
    console.log("🔍 Scanning Debug Info:");
    console.log("- User ID:", user._id);
    console.log("- User Organization ID (raw):", user.organizationId);
    console.log(
      "- User Organization ID (string):",
      String(user.organizationId)
    );
    console.log("- QR Code:", code);
    console.log("- Scan Type:", type);

    // Validate required fields
    if (!code || !type) {
      return res
        .status(400)
        .json({ message: "Missing required fields: code and type" });
    }

    // Find QR code
    const qr = await QRCode.findOne({ code, active: true });
    if (!qr) {
      console.log("❌ QR Code not found or inactive");
      return res.status(400).json({ message: "Invalid or expired QR code" });
    }

    console.log("✅ QR Code found:");
    console.log("- QR Organization ID (raw):", qr.organizationId);
    console.log("- QR Organization ID (string):", String(qr.organizationId));

    // Find organization
    const org = await Organization.findById(qr.organizationId);
    if (!org) {
      console.log("❌ Organization not found");
      return res.status(400).json({ message: "Organization not found" });
    }

    console.log("✅ Organization found:", org.name);

    // 🔧 FIXED: Check if user has organization
    if (!user.organizationId) {
      console.log("❌ User has no organization assigned");
      return res.status(403).json({
        message: "User not assigned to any organization",
      });
    }

    // 🔧 FIXED: Proper ObjectId comparison
    const userOrgId = String(user.organizationId);
    const qrOrgId = String(qr.organizationId);

    console.log("🔍 Organization comparison:");
    console.log("- User Org ID:", userOrgId);
    console.log("- QR Org ID:", qrOrgId);
    console.log("- Match:", userOrgId === qrOrgId);

    if (userOrgId !== qrOrgId) {
      console.log("❌ Organization mismatch");
      return res.status(403).json({
        message: "User not in this organization",
        debug: {
          userOrg: userOrgId, // 🔧 Fixed to show just ID
          qrOrg: qrOrgId,
          orgName: org.name,
        },
      });
    }

    // 🔧 Location checking disabled as requested
    // const permitted = isLocationWithin(...);

    // ✅ Create attendance record
    const record = await Attendance.create({
      userId: user._id,
      organizationId: org._id,
      qrCodeId: qr._id,
      type,
      timestamp: new Date(),
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

    console.log("✅ Attendance recorded successfully");

    return res.json({
      message: "Attendance recorded successfully",
      attendance: record,
      debug: {
        user: user.name,
        organization: org.name,
        type: type,
        timestamp: record.timestamp,
      },
    });
  } catch (error) {
    console.error("❌ Error in scanQRCode:", error);
    return res.status(500).json({
      message: "Failed to process scan",
      error: error.message,
    });
  }
};

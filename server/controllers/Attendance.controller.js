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

    const istOffset = 5.5 * 60 * 60 * 1000; // +5:30 hrs

    const records = await Attendance.find({
      userId,
      createdAt: { $gte: oneMonthAgo },
    }).sort({ createdAt: -1 });

    const formatted = records.map(r => {
      const obj = r.toObject();
      obj.createdAtIST = new Date(r.createdAt.getTime() + istOffset);
      obj.updatedAtIST = new Date(r.updatedAt.getTime() + istOffset);
      return obj;
    });

    res.json({ records: formatted });
  } catch (error) {
    console.error("Error fetching user attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
};


// exports.getUserPastAttendance = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const oneMonthAgo = new Date();
//     oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//     const records = await Attendance.find({
//       userId,
//       // timestamp: { $gte: oneMonthAgo },
//     }).sort({ timestamp: -1 });

//     res.json({ records });
//   } catch (error) {
//     console.error("Error fetching user attendance:", error);
//     res.status(500).json({ message: "Failed to fetch attendance records" });
//   }
// };


exports.scanQRCode = async (req, res) => {
  try {
    const { code, location, type, deviceInfo } = req.body;
    const user = req.user;

    if (!code || !type) {
      return res
        .status(400)
        .json({ message: "Missing required fields: code and type" });
    }

    const qr = await QRCode.findOne({ code, active: true });
    if (!qr) {
      return res.status(400).json({ message: "Invalid or expired QR code" });
    }

    const org = await Organization.findById(qr.organizationId);
    if (!org) {
      return res.status(400).json({ message: "Organization not found" });
    }

    if (!user.organizationId) {
      return res
        .status(403)
        .json({ message: "User not assigned to any organization" });
    }

    if (String(user.organizationId) !== String(qr.organizationId)) {
      return res.status(403).json({ message: "User not in this organization" });
    }

    const safeLocation =
      location && location.latitude && location.longitude
        ? location
        : { latitude: 0, longitude: 0, accuracy: 0 };
    const safeDeviceInfo = deviceInfo || {};

    const record = await Attendance.create({
      userId: user._id,
      organizationId: org._id,
      qrCodeId: qr._id,
      type,
      location: safeLocation,
      deviceInfo: safeDeviceInfo,
      verified: true,
      verificationDetails: {
        locationMatch: true,
        qrCodeValid: true,
        timeValid: true,
        deviceTrusted: true,
        spoofingDetected: false,
      },
    });

    // Convert to IST
    const istOffset = 5.5 * 60 * 60 * 1000;
    const recordObj = record.toObject();
    recordObj.createdAtIST = new Date(record.createdAt.getTime() + istOffset);
    recordObj.updatedAtIST = new Date(record.updatedAt.getTime() + istOffset);

    qr.usageCount += 1;
    await qr.save();

    return res.json({
      message: "Attendance recorded successfully",
      attendance: recordObj,
      debug: {
        user: user.name,
        organization: org.name,
        type: type,
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


// exports.scanQRCode = async (req, res) => {
//   try {
//     const { code, location, type, deviceInfo } = req.body;
//     const user = req.user;

//     // Validate required fields
//     if (!code || !type) {
//       return res
//         .status(400)
//         .json({ message: "Missing required fields: code and type" });
//     }

//     // Find QR code
//     const qr = await QRCode.findOne({ code, active: true });
//     if (!qr) {
//       return res.status(400).json({ message: "Invalid or expired QR code" });
//     }

//     // Find organization
//     const org = await Organization.findById(qr.organizationId);
//     if (!org) {
//       return res.status(400).json({ message: "Organization not found" });
//     }

//     if (!user.organizationId) {
//       return res
//         .status(403)
//         .json({ message: "User not assigned to any organization" });
//     }

//     // Check organization match
//     if (String(user.organizationId) !== String(qr.organizationId)) {
//       return res.status(403).json({ message: "User not in this organization" });
//     }

//     // By default, if location or deviceInfo is not provided, use empty or default values
//     const safeLocation =
//       location && location.latitude && location.longitude
//         ? location
//         : { latitude: 0, longitude: 0, accuracy: 0 };
//     const safeDeviceInfo = deviceInfo || {};

//     // Create attendance record safely without forcing deviceId or location fields
//     const record = await Attendance.create({
//       userId: user._id,
//       organizationId: org._id,
//       qrCodeId: qr._id,
//       type,
//       timestamp: new Date(),
//       location: safeLocation,
//       deviceInfo: safeDeviceInfo,
//       // timestamp: new Date(),
//       location: location || { latitude: 0, longitude: 0, accuracy: 0 },
//       deviceInfo: deviceInfo || {},
//       verified: true,
//       verificationDetails: {
//         locationMatch: true,
//         qrCodeValid: true,
//         timeValid: true,
//         deviceTrusted: true,
//         spoofingDetected: false,
//       },
//     });

//     // Update QR usage count
//     qr.usageCount += 1;
//     await qr.save();

//     return res.json({
//       message: "Attendance recorded successfully",
//       attendance: record,
//       debug: {
//         user: user.name,
//         organization: org.name,
//         type: type,
//         // timestamp: record.timestamp,
//       },
//     });
//   } catch (error) {
//     console.error("Error in scanQRCode:", error);
//     return res.status(500).json({
//       message: "Failed to process scan",
//       error: error.message,
//     });
//   }
// };

const express = require("express");
const router = express.Router();

// Only keep auth, remove antiSpoofingMiddleware and fingerprintCheckMiddleware
const auth = require("../middleware/Auth.middleware");
const attendanceController = require("../controllers/Attendance.controller");
const Attendance = require("../models/Attendance.models");

// 💡 QR scan with ALL security features disabled for testing
router.post(
  "/scan",
  auth,
  attendanceController.scanQRCode
);

router.get("/records", auth, async (req, res) => {
  try {
    if (!req.user.organizationId) {
      return res.status(400).json({ message: "No organization associated with user" });
    }
    const { organizationId } = req.user;
    const { page = 1, limit = 20 } = req.query;
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const records = await Attendance.find({ organizationId })
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Attendance.countDocuments({ organizationId });
    res.json({
      records,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
});

module.exports = router;

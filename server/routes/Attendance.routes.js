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



module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../middleware/Auth.middleware");
const attendanceController = require("../controllers/Attendance.controller");

// Scan QR
router.post("/scan", auth, attendanceController.scanQRCode);

// Get past attendance for logged-in user
router.get("/past", auth, attendanceController.getUserPastAttendance);

module.exports = router;

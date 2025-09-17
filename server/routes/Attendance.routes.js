const express = require("express");
const router = express.Router();
const auth = require("../middleware/Auth.middleware");
const attendanceController = require("../controllers/Attendance.controller");
const upload = require("../middleware/multer.middleware");
const qrRateLimiter = require("../middleware/qrRateLimiter.middleware");

// Scan QR
// router.post("/scan", auth, attendanceController.scanQRCode);
router.post("/scan", auth , qrRateLimiter, attendanceController.scanQRCode);


// Get past attendance for logged-in user
router.get("/past", auth, attendanceController.getUserPastAttendance);


// POST /attendance/upload
router.post("/upload", upload.single("file"), attendanceController.uploadAttendanceFile);


module.exports = router;

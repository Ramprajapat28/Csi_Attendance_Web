const User = require("../models/user.models");
const Attendance = require("../models/Attendance.models");
const QRCode = require("../models/Qrcode.models");
const Organization = require("../models/organization.models");

// Define the missing records function to avoid route errors
const records = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    if (!orgId) {
      return res
        .status(400)
        .json({ message: "User not associated with any organization" });
    }
    const attendanceRecords = await Attendance.find({ organizationId: orgId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ attendanceRecords });
  } catch (error) {
    console.error("Error getting records:", error);
    res.status(500).json({ message: "Failed to fetch records" });
  }
};

const getOrganizationQRCodes = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    if (!orgId) {
      return res
        .status(400)
        .json({ message: "User not associated with any organization" });
    }
    const org = await Organization.findById(orgId)
      .populate("checkInQRCodeId")
      .populate("checkOutQRCodeId");
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.json({
      checkInQRCode: org.checkInQRCodeId,
      checkOutQRCode: org.checkOutQRCodeId,
    });
  } catch (error) {
    console.error("Error fetching organization's QR codes:", error);
    res.status(500).json({ message: "Failed to fetch QR codes" });
  }
};

const getTodaysAttendance = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    if (!orgId) {
      return res
        .status(400)
        .json({ message: "User not associated with any organization" });
    }

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // +5:30 hrs
    const istNow = new Date(now.getTime() + istOffset);

    const startOfDayIST = new Date(
      Date.UTC(
        istNow.getUTCFullYear(),
        istNow.getUTCMonth(),
        istNow.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
    const endOfDayIST = new Date(
      Date.UTC(
        istNow.getUTCFullYear(),
        istNow.getUTCMonth(),
        istNow.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );

    // Fetch records
    const records = await Attendance.find({
      organizationId: orgId,
      createdAt: { $gte: startOfDayIST, $lte: endOfDayIST },
    }).populate("userId", "name email");

    // Add IST time to response
    const formatted = records.map((record) => {
      const obj = record.toObject();
      obj.timeIST = new Date(record.createdAt.getTime() + istOffset);
      return obj;
    });
    res.json({ records: formatted });

    // const startOfDay = new Date();
    // startOfDay.setHours(0, 0, 0, 0);
    // const endOfDay = new Date();
    // endOfDay.setHours(23, 59, 59, 999);
    // const records = await Attendance.find({
    //   organizationId: orgId,
    //   // timestamp: { $gte: startOfDay, $lte: endOfDay },
    // }).populate("userId", "name email");
    // res.json({ records });
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({ message: "Failed to fetch today's attendance" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (String(user.organizationId) !== String(req.user.organizationId)) {
      return res.status(403).json({
        message: "Forbidden to delete user outside your organization",
      });
    }
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

const singleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("organizationId", "name");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching single user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
module.exports = {
  records,
  singleUser,
  getOrganizationQRCodes,
  getTodaysAttendance,
  deleteUser,
};

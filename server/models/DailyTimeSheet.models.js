const mongoose = require("mongoose");

const dailyTimeSheetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    sessions: [
      {
        checkIn: {
          time: Date,
          attendanceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attendance",
          },
        },
        checkOut: {
          time: Date,
          attendanceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attendance",
          },
        },
        duration: Number, // in minutes
      },
    ],
    totalWorkingTime: {
      type: Number, // in minutes
      default: 0,
    },
    status: {
      type: String,
      enum: ["absent", "half-day", "full-day"],
      default: "absent",
    },
    requiredWorkingHours: {
      type: Number,
      default: 480, // 8 hours in minutes
    },
  },
  { timestamps: true }
);

// Indexes for performance
dailyTimeSheetSchema.index({ userId: 1, date: -1 });
dailyTimeSheetSchema.index({ organizationId: 1, date: -1 });
dailyTimeSheetSchema.index({ date: 1 });

module.exports = mongoose.model("DailyTimeSheet", dailyTimeSheetSchema);

require("dotenv").config();
const express = require("express");
const connectDB = require("./config/Database");
const customCors = require("./config/cors");
const ScheduleAttendanceCheck = require("./utils/timeRefresher");
const compression = require('compression');
const helmet = require("helmet");
const morgan = require('morgan'); 
const logger = require('./utils/logger'); 

// const mongoSanitize = require('express-mongo-sanitize');
const app = express();
app.use(helmet());
app.use(compression());
// app.use(mongoSanitize({ replaceWith: '_removed' }));

// Morgan + Winston (log HTTP requests)
app.use(morgan('tiny', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Root
app.get('/', (req, res) => {
  res.send('Hello from Express + Winston');
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: 'Something went wrong!' });
});



// 🔥 NEW: Global error handling
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

// Connect to database first
connectDB();

// Middleware
app.use(customCors);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 🔥 NEW: Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
const authRoutes = require("./routes/auth.routes");
const qrcodeRoutes = require("./routes/qrcode.routes");
const attendanceRoutes = require("./routes/Attendance.routes");
const adminRoutes = require("./routes/admin.routes");
const passwordResetRoutes = require("./routes/resetPassword.routes");

app.use("/auth2", authRoutes);
app.use("/qrcode", qrcodeRoutes);
app.use("/attend", attendanceRoutes);
app.use("/admin", adminRoutes);
app.use("/password", passwordResetRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// 🔥 NEW: Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Global error handler:", error);
  res.status(500).json({
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: error.message }),
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  ScheduleAttendanceCheck();
});

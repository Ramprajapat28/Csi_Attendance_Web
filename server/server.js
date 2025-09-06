require("dotenv").config();
const express = require("express");
const connectDB = require("./config/Database");
const customCors = require("./config/cors");

const app = express();

// Connect to database first
connectDB();

// ⚠️ CRITICAL: Middleware order matters!
// 1. CORS must come first
app.use(customCors);

// 2. Body parsing middleware BEFORE routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. Import routes AFTER middleware
const authRoutes = require("./routes/auth.routes");
const qrcodeRoutes = require("./routes/qrcode.routes");
const attendanceRoutes = require("./routes/Attendance.routes");
const adminRoutes = require("./routes/admin.routes")

// 4. Routes come LAST
app.use("/auth2", authRoutes);
app.use("/qrcode", qrcodeRoutes);
app.use("/attend", attendanceRoutes);
app.use("/admin", adminRoutes)

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});





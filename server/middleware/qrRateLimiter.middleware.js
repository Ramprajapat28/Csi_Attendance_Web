const rateLimit = require("express-rate-limit");

// Limit: 1 request per 10 seconds per user
const qrRateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 sec
  max: 1,
  keyGenerator: (req, res) => {
    return req.user ? req.user._id.toString() : req.ip; // per user if logged in, fallback to IP
  },
  message: {
    success: false,
    message: "Too many scans! Please wait before scanning again."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = qrRateLimiter;

const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit"); // ✅ import helper

// Limit: 1 request per 10 seconds per user
const qrRateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 sec
  max: 1,
  keyGenerator: (req, res) => {
    // ✅ Use user ID if logged in, fallback safely to IP (IPv4 + IPv6)
    return req.user ? req.user._id.toString() : ipKeyGenerator(req);
  },
  message: {
    success: false,
    message: "Too many scans! Please wait before scanning again."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = qrRateLimiter;

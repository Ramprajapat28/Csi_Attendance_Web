const rateLimit = require("express-rate-limit");

// Import the ipKeyGenerator helper for IPv6 safety
const { ipKeyGenerator } = require("express-rate-limit");

// Rate limit for AI queries - IPv6 safe
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 AI requests per window
  message: {
    error: "Too many AI requests from this user",
    retryAfter: "Please try again in 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  // ✅ FIXED: IPv6-safe keyGenerator using ipKeyGenerator helper
  keyGenerator: (req, res) => {
    // Use user ID if authenticated
    if (req.user && req.user._id) {
      return req.user._id.toString();
    }
    // ✅ Use ipKeyGenerator for IPv6 safety instead of req.ip directly
    return ipKeyGenerator(req.ip);
  },
  handler: (req, res) => {
    console.log(`🚨 AI Rate limit exceeded for user: ${req.user?.email || req.ip}`);
    res.status(429).json({
      error: "Too many AI requests",
      message: "You've exceeded the AI query limit. Please try again later.",
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limit for AI info endpoints
const aiInfoRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes  
  max: 100, // 100 requests per 5 minutes
  message: {
    error: "Too many requests for AI info"
  },
  // ✅ IPv6-safe keyGenerator for info endpoints too
  keyGenerator: (req, res) => {
    if (req.user && req.user._id) {
      return `info_${req.user._id.toString()}`;
    }
    return `info_${ipKeyGenerator(req.ip)}`;
  }
});

module.exports = {
  aiRateLimit,
  aiInfoRateLimit
};

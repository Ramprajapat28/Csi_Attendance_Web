const express = require("express");
const router = express.Router();
const auth = require("../middleware/Auth.middleware");
const role = require("../middleware/role.middleware");
const { aiRateLimit, aiInfoRateLimit } = require("../middleware/aiRateLimit.middleware");

// ✅ Make sure this import works
const aiAnalyticsController = require("../controllers/aiAnalytics.controller");

// AI query endpoint
router.post(
  "/query",
  auth,
  role(["organization"]), 
  aiRateLimit,
  aiAnalyticsController.processAIQuery
);

// Get AI capabilities
router.get(
  "/capabilities", 
  auth,
  role(["organization"]),
  aiInfoRateLimit,
  aiAnalyticsController.getAICapabilities
);

// Health check
router.get(
  "/health",
  auth, 
  role(["organization"]),
  aiAnalyticsController.getAIHealth
);

// ✅ CRITICAL: Make sure you export the router
module.exports = router;

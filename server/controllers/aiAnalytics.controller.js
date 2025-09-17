const { getAIAgent } = require("../utils/aiAgent");

const processAIQuery = async (req, res) => {
  try {
    const { question } = req.body;
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        message: "Organization context missing. Please ensure you're logged in as an organization admin.",
      });
    }

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    console.log(`🤖 AI Query from ${req.user.email} (Org: ${organizationId}): ${question}`);
    
    const aiAgent = await getAIAgent();
    const response = await aiAgent.query(question, organizationId.toString());

    res.json({
      question: question,
      response: response,
      timestamp: new Date().toISOString(),
      user: req.user.email,
      organizationId: organizationId,
    });
  } catch (error) {
    console.error("AI Analytics error:", error);
    res.status(500).json({
      message: "AI processing failed",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

const getAICapabilities = async (req, res) => {
  try {
    res.json({
      capabilities: [
        "Check user presence on specific dates",
        "Generate daily attendance summaries",
        "Weekly attendance reports",
        "Find late users",
        "Find absent users",
        "Individual user statistics",
      ],
      examples: [
        "Was john@example.com present yesterday?",
        "Show me today's attendance summary",
        "Who was late today?",
        "Generate weekly report for this week",
      ],
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get AI capabilities" });
  }
};

const getAIHealth = async (req, res) => {
  try {
    const aiAgent = await getAIAgent();
    res.json({
      status: aiAgent.isInitialized ? "healthy" : "initializing",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
    });
  }
};

module.exports = {
  processAIQuery,
  getAICapabilities,
  getAIHealth,
};

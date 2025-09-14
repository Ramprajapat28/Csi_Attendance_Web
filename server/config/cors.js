const cors = require("cors");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "*",
      "https://csi-attendance-client.onrender.com",
      "http://192.168.29.219:5173",
      // "http://localhost:3000",
      // "http://localhost:3001",
      // " https://csi-attendance-web-i3n1.onrender.com",
      "http://localhost:5173",
      // "http://127.0.0.1:3000",
      // "http://127.0.0.1:5000",
      // "http://127.0.0.1:5500", // Live Server default port
      // "null", // For local HTML files (file:// protocol)
      process.env.FRONTEND_URL,
    ];

    if (
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin === "null" ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },

  credentials: true,
  optionsSuccessStatus: 200,

  methods: ["GET", "POST", "PUT"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],

  exposedHeaders: ["Set-Cookie"],

  preflightContinue: false,
};

module.exports = cors(corsOptions);

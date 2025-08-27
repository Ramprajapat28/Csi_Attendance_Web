const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/qrocde";

// keep your URI in .env file

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    });

    // Optional: ping test
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("✅ MongoDB connected & ping successful");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // exit app if DB fails
  }
};

module.exports = connectDB;

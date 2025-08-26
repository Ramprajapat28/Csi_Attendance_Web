const mongoose = require("mongoose");
require("dotenv").config();

const uri =
  "mongodb+srv://warangadvait3000:Advait.3000@cluster0.bdx96p0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

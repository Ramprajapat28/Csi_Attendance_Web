const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb+srv://aryanmadkar70_db_user:aryan@cluster0.oxxw1kn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

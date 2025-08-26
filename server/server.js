require("dotenv").config();
const connectDB = require("./config/database");

const express = require("express");
const app = express();
connectDB();

const router = require("./routes/auth.routes");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth2", router);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

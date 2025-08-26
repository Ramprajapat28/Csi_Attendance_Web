require("dotenv").config();
const connectDB = require("./config/database");

const express = require("express");
const app = express();
connectDB();
const qrcoderoutes = require("../server/routes/qrcode.routes");
const router = require("./routes/auth.routes");
const { scanQRCode } = require("./controllers/Attendance.controller");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth2", router);


app.use("/qrcode", qrcoderoutes);
app.use("/attend", scanQRCode);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

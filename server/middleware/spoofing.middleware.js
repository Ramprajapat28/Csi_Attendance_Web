// middleware/fingerprintCheck.js
const User = require("../models/User");
const fingerprint = require("../utils/fingerprint"); // <- require fingerprint.js

async function fingerprintCheckMiddleware(req, res, next) {
  try {
    const { fingerprint: fp } = req.body; // client sends fingerprint
    const user = req.user;

    if (!user) return res.status(401).json({ message: "User not authenticated", spoofingDetected: true });
    if (!fp) return res.status(400).json({ message: "Fingerprint is required", spoofingDetected: true });

    if (!fingerprint.isFingerprintAllowed(user, fp)) {
      fingerprint.logSuspicious(user, fp);
      await user.save();
      return res.status(403).json({ message: "Device not authorized", spoofingDetected: true });
    }

    // Ensure fingerprint is stored if first-time registration
    user.deviceInfo = user.deviceInfo || {};
    if (!user.deviceInfo.registeredFingerprint) {
      user.deviceInfo.registeredFingerprint = fp;
      user.deviceInfo.registeredFingerprints = [{ visitorId: fp, createdAt: new Date() }];
    }

    await user.save();
    req.deviceFingerprint = fp;
    next();
  } catch (err) {
    console.error("Fingerprint check middleware error:", err);
    res.status(500).json({ message: "Fingerprint verification failed", spoofingDetected: true });
  }
}

module.exports = fingerprintCheckMiddleware;

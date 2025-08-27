const User = require("../models/user.models"); // Fixed import path
const fingerprint = require("../utils/fingerprint");

async function fingerprintCheckMiddleware(req, res, next) {
    try {
        const { fingerprint: fp } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ 
                message: "User not authenticated", 
                spoofingDetected: true 
            });
        }

        if (!fp) {
            return res.status(400).json({ 
                message: "Device fingerprint is required for security", 
                spoofingDetected: true 
            });
        }

        // Initialize device info if not exists
        if (!user.deviceInfo) {
            user.deviceInfo = {};
        }

        if (!fingerprint.isFingerprintAllowed(user, fp)) {
            fingerprint.logSuspicious(user, fp);
            await user.save();
            
            return res.status(403).json({ 
                message: "Device not authorized. Please register this device first.", 
                spoofingDetected: true,
                action: "device_registration_required"
            });
        }

        // Register fingerprint if first time
        if (!user.deviceInfo.registeredFingerprint) {
            user.deviceInfo.registeredFingerprint = fp;
            user.deviceInfo.registeredFingerprints = user.deviceInfo.registeredFingerprints || [];
            user.deviceInfo.registeredFingerprints.push({ 
                visitorId: fp, 
                createdAt: new Date(),
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip
            });
            await user.save();
            console.log("✅ New device fingerprint registered for user:", user.name);
        }

        req.deviceFingerprint = fp;
        next();

    } catch (err) {
        console.error("Fingerprint check middleware error:", err);
        res.status(500).json({ 
            message: "Device verification failed", 
            spoofingDetected: true 
        });
    }
}

module.exports = fingerprintCheckMiddleware;

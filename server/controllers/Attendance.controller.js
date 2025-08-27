const Attendance = require("../models/Attendance.models");
const QRCode = require("../models/Qrcode.models");
const Organization = require("../models/organization.models");
const geolib = require("geolib");
const { isLocationWithin } = require("../utils/locationVerifier");

exports.scanQRCode = async (req, res) => {
    try {
        const { code, location, type, deviceInfo, fingerprint } = req.body;
        const user = req.user;

        console.log("🔍 Scanning with ALL FEATURES ENABLED:");
        console.log("- User ID:", user._id);
        console.log("- Location provided:", location);
        console.log("- Device Info:", deviceInfo);
        console.log("- Fingerprint:", fingerprint);

        // ✅ VALIDATE ALL REQUIRED FIELDS
        if (!code || !type) {
            return res.status(400).json({ 
                message: "Missing required fields: code and type" 
            });
        }

        if (!location || !location.latitude || !location.longitude) {
            return res.status(400).json({ 
                message: "Location data is required for attendance",
                required: "latitude, longitude"
            });
        }

        if (!deviceInfo || !deviceInfo.deviceId) {
            return res.status(400).json({ 
                message: "Device information is required",
                required: "deviceId, platform, userAgent"
            });
        }

        if (!fingerprint) {
            return res.status(400).json({ 
                message: "Device fingerprint is required for security" 
            });
        }

        // Find QR code
        const qr = await QRCode.findOne({ code, active: true });
        if (!qr) {
            console.log("❌ QR Code not found or inactive");
            return res.status(400).json({ message: "Invalid or expired QR code" });
        }

        // Find organization
        const org = await Organization.findById(qr.organizationId);
        if (!org) {
            console.log("❌ Organization not found");
            return res.status(400).json({ message: "Organization not found" });
        }

        // Check user organization match
        if (!user.organizationId) {
            return res.status(403).json({
                message: "User not assigned to any organization",
            });
        }

        const userOrgId = String(user.organizationId);
        const qrOrgId = String(qr.organizationId);
        
        if (userOrgId !== qrOrgId) {
            return res.status(403).json({
                message: "User not authorized for this organization",
                spoofingDetected: true
            });
        }

        // ✅ LOCATION VERIFICATION ENABLED
        let locationMatch = false;
        let locationError = null;

        if (org.location && org.location.latitude && org.location.longitude) {
            const tolerance = org.settings?.locationToleranceMeters || 50;
            locationMatch = isLocationWithin(org.location, location, tolerance);
            
            if (!locationMatch) {
                const distance = geolib.getDistance(
                    { latitude: org.location.latitude, longitude: org.location.longitude },
                    { latitude: location.latitude, longitude: location.longitude }
                );
                locationError = `You are ${distance}m away from the allowed location (max: ${tolerance}m)`;
            }
        } else {
            console.log("⚠️ Organization location not set, skipping location check");
            locationMatch = true; // Allow if org location not configured
        }

        // ✅ DEVICE FINGERPRINT CHECK (handled by middleware, but double-check)
        const storedFingerprint = user.deviceInfo?.registeredFingerprint;
        const fingerprintMatch = !storedFingerprint || storedFingerprint === fingerprint;

        // ✅ COMPREHENSIVE VERIFICATION
        const verificationDetails = {
            locationMatch,
            qrCodeValid: true,
            deviceTrusted: fingerprintMatch,
            spoofingDetected: req.spoofingCheck ? !req.spoofingCheck.passed : false,
            accuracyCheck: location.accuracy ? location.accuracy <= 100 : false
        };

        const allChecksPass = verificationDetails.locationMatch && 
                            verificationDetails.qrCodeValid && 
                            verificationDetails.deviceTrusted && 
                            !verificationDetails.spoofingDetected;

        // Create attendance record with full verification
        const record = await Attendance.create({
            userId: user._id,
            organizationId: org._id,
            qrCodeId: qr._id,
            type,
            timestamp: new Date(),
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy || 0
            },
            deviceInfo: {
                deviceId: deviceInfo.deviceId,
                platform: deviceInfo.platform,
                userAgent: deviceInfo.userAgent,
                ipAddress: req.ip || deviceInfo.ipAddress
            },
            verified: allChecksPass,
            verificationDetails,
            notes: locationError || (allChecksPass ? "All verifications passed" : "Some verifications failed")
        });

        // Update QR usage count
        qr.usageCount += 1;
        await qr.save();

        // ✅ RESPONSE WITH FULL SECURITY STATUS
        const response = {
            message: allChecksPass ? "Attendance recorded successfully" : "Attendance recorded with warnings",
            success: true,
            verified: allChecksPass,
            attendance: {
                id: record._id,
                type: record.type,
                timestamp: record.timestamp,
                verified: record.verified
            },
            verificationStatus: {
                location: locationMatch ? "✅ Verified" : `❌ ${locationError}`,
                device: fingerprintMatch ? "✅ Trusted" : "⚠️ New device registered",
                spoofing: !verificationDetails.spoofingDetected ? "✅ Clean" : "❌ Detected",
                accuracy: verificationDetails.accuracyCheck ? "✅ Good" : "⚠️ Low accuracy"
            }
        };

        if (!allChecksPass) {
            response.warnings = [];
            if (!locationMatch) response.warnings.push("Location verification failed");
            if (!fingerprintMatch) response.warnings.push("New device detected");
            if (verificationDetails.spoofingDetected) response.warnings.push("Suspicious activity detected");
        }

        return res.json(response);

    } catch (error) {
        console.error("❌ Error in scanQRCode:", error);
        return res.status(500).json({
            message: "Failed to process scan",
            error: error.message,
        });
    }
};

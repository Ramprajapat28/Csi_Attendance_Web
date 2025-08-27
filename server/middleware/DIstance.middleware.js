const geolib = require("geolib");

const antiSpoofingMiddleware = async (req, res, next) => {
  try {
    const { location, deviceInfo } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "User not authenticated",
        spoofingDetected: true,
      });
    }

    // ✅ STRICT LOCATION VALIDATION
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        message: "Precise location is required for attendance",
        spoofingDetected: true,
        required: ["latitude", "longitude", "accuracy"],
      });
    }

    // ✅ CHECK FOR MOCK LOCATION
    if (
      deviceInfo &&
      (deviceInfo.isMockLocation || deviceInfo.isFromMockProvider)
    ) {
      return res.status(400).json({
        message:
          "Mock/fake location detected. Please disable mock location in device settings.",
        spoofingDetected: true,
        code: "MOCK_LOCATION_DETECTED",
      });
    }

    // ✅ ACCURACY VALIDATION
    if (!location.accuracy || location.accuracy > 100) {
      return res.status(400).json({
        message: `Location accuracy too low (${location.accuracy}m). Please ensure GPS is enabled and try again.`,
        spoofingDetected: true,
        minimumAccuracy: 100,
      });
    }

    // ✅ RAPID MOVEMENT DETECTION
    if (user.deviceInfo && user.deviceInfo.lastKnownLocation) {
      const lastLocation = user.deviceInfo.lastKnownLocation;
      const currentTime = new Date();
      const lastTime = new Date(lastLocation.timestamp);
      const timeDiff = currentTime - lastTime;

      if (timeDiff < 60000) {
        // Less than 1 minute
        const distance = geolib.getDistance(
          {
            latitude: lastLocation.latitude,
            longitude: lastLocation.longitude,
          },
          { latitude: location.latitude, longitude: location.longitude }
        );

        // More than 1km in under 1 minute is suspicious
        if (distance > 1000) {
          return res.status(400).json({
            message: `Suspicious movement detected: ${distance}m in ${Math.round(
              timeDiff / 1000
            )}s`,
            spoofingDetected: true,
            code: "RAPID_MOVEMENT_DETECTED",
          });
        }
      }
    }

    // ✅ IP GEOLOCATION CHECK (basic)
    const currentIP = req.ip || req.connection.remoteAddress;
    if (
      user.deviceInfo &&
      user.deviceInfo.lastKnownIP &&
      user.deviceInfo.lastKnownIP !== currentIP
    ) {
      console.log(
        "⚠️ IP address changed:",
        user.deviceInfo.lastKnownIP,
        "->",
        currentIP
      );
    }

    // ✅ UPDATE USER LOCATION
    if (!user.deviceInfo) user.deviceInfo = {};

    user.deviceInfo.lastKnownLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: new Date(),
    };

    user.deviceInfo.lastKnownIP = currentIP;
    await user.save();

    // ✅ PASS VALIDATION RESULT TO NEXT MIDDLEWARE
    req.spoofingCheck = {
      passed: true,
      location: location,
      validationsPassed: [
        "location_provided",
        "accuracy_acceptable",
        "no_mock_location",
        "movement_pattern_normal",
      ],
    };

    console.log("✅ Anti-spoofing checks passed for user:", user.name);
    next();
  } catch (error) {
    console.error("Anti-spoofing middleware error:", error);
    return res.status(500).json({
      message: "Location verification failed",
      spoofingDetected: true,
    });
  }
};

module.exports = antiSpoofingMiddleware;

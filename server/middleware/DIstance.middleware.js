const geolib = require("geolib");
const { isLocationWithin } = require("../utils/locationVerifier"); // Optional helper if you use it

const antiSpoofingMiddleware = async (req, res, next) => {
  try {
    const { location, deviceInfo } = req.body;
    const user = req.user;

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "User not authenticated",
        spoofingDetected: true,
      });
    }

    // Check if location is provided
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        message: "Location is required",
        spoofingDetected: true,
      });
    }

    // Check for mock location indicators
    if (deviceInfo && deviceInfo.isMockLocation) {
      return res.status(400).json({
        message: "Mock location detected",
        spoofingDetected: true,
      });
    }

    // Check accuracy
    if (location.accuracy && location.accuracy > 100) {
      return res.status(400).json({
        message: "Location accuracy too low",
        spoofingDetected: true,
      });
    }

    // Check for rapid location changes
    if (user.deviceInfo && user.deviceInfo.lastKnownLocation) {
      const lastLocation = user.deviceInfo.lastKnownLocation;
      const currentTime = new Date();
      const lastTime = new Date(lastLocation.timestamp);

      if (currentTime - lastTime < 60000) {
        const distance = geolib.getDistance(
          { latitude: lastLocation.latitude, longitude: lastLocation.longitude },
          { latitude: location.latitude, longitude: location.longitude }
        );
        if (distance > 1000) {
          return res.status(400).json({
            message: "Suspicious location change detected",
            spoofingDetected: true,
          });
        }
      }
    }

    // ✅ Update user’s last known location & IP
    user.deviceInfo.lastKnownLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date(),
    };

    if (deviceInfo && deviceInfo.ipAddress) {
      user.deviceInfo.lastKnownIP = deviceInfo.ipAddress; // Add field to schema if not present
    }

    await user.save();

    // ✅ Attach result to request (for downstream use)
    req.spoofingCheck = {
      passed: true,
      location: location,
    };

    // Continue
    next();

  } catch (error) {
    console.error("Anti-spoofing middleware error:", error);
    return res.status(500).json({ message: "Location verification failed" });
  }
};

module.exports = antiSpoofingMiddleware;

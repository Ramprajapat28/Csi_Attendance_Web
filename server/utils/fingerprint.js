// utils/fingerprint.js
// Handles fingerprint registration and verification logic

const fingerprintUtils = {};

/**
 * Checks if a given fingerprint is allowed for the user.
 * Registers it if it's the first-time fingerprint.
 */
fingerprintUtils.isFingerprintAllowed = function(user, fp) {
  if (!user.deviceInfo) user.deviceInfo = {};

  // First-time registration
  if (!user.deviceInfo.registeredFingerprint) {
    user.deviceInfo.registeredFingerprint = fp;
    user.deviceInfo.registeredFingerprints = [{ visitorId: fp, createdAt: new Date() }];
    return true;
  }

  // Check if fingerprint matches registered ones
  const allowed =
    user.deviceInfo.registeredFingerprint === fp ||
    (user.deviceInfo.registeredFingerprints || []).some(f => f.visitorId === fp);

  return allowed;
};

/**
 * Logs suspicious fingerprint attempts for auditing
 */
fingerprintUtils.logSuspicious = function(user, fp) {
  user.suspiciousLogs = user.suspiciousLogs || [];
  user.suspiciousLogs.push({
    date: new Date(),
    reason: "Fingerprint mismatch",
    meta: { fingerprint: fp }
  });
};

module.exports = fingerprintUtils;



// for frontend //

// const FingerprintJS = require('@fingerprintjs/fingerprintjs');

// async function getFingerprint() {
//   const fp = await FingerprintJS.load();
//   const result = await fp.get();
//   return result.visitorId; // stable fingerprint
// }

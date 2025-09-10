const NodeCache = require("node-cache");

// Default TTL = 5 min (300 sec), clean expired keys every 10 min
const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

class CacheModel {
  // Save key-value in cache
  static set(key, value, ttl = 300) {
    return cache.set(key, value, ttl);
  }

  // Get value by key
  static get(key) {
    return cache.get(key);
  }

  // Delete key
  static del(key) {
    return cache.del(key);
  }

  // Check if key exists
  static has(key) {
    return cache.has(key);
  }
}


module.exports = CacheModel;

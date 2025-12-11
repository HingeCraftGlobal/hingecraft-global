/**
 * Rate Limiter Utility
 * Implements rate limiting for API calls
 */

const logger = require('./logger');

class RateLimiter {
  constructor(options = {}) {
    this.limits = new Map();
    this.windows = new Map();
    this.defaultLimit = options.defaultLimit || 100; // requests
    this.defaultWindow = options.defaultWindow || 60000; // 1 minute in ms
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key, limit = null, window = null) {
    const requestLimit = limit || this.defaultLimit;
    const requestWindow = window || this.defaultWindow;
    const now = Date.now();

    // Get or create rate limit entry
    if (!this.limits.has(key)) {
      this.limits.set(key, {
        count: 0,
        resetTime: now + requestWindow
      });
    }

    const entry = this.limits.get(key);

    // Reset if window expired
    if (now >= entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + requestWindow;
    }

    // Check if limit exceeded
    if (entry.count >= requestLimit) {
      const waitTime = Math.ceil((entry.resetTime - now) / 1000);
      return {
        allowed: false,
        waitTime: waitTime,
        resetTime: entry.resetTime
      };
    }

    // Increment count
    entry.count++;

    return {
      allowed: true,
      remaining: requestLimit - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key) {
    this.limits.delete(key);
  }

  /**
   * Get current status
   */
  getStatus(key) {
    if (!this.limits.has(key)) {
      return {
        count: 0,
        limit: this.defaultLimit,
        remaining: this.defaultLimit
      };
    }

    const entry = this.limits.get(key);
    const now = Date.now();

    if (now >= entry.resetTime) {
      return {
        count: 0,
        limit: this.defaultLimit,
        remaining: this.defaultLimit
      };
    }

    return {
      count: entry.count,
      limit: this.defaultLimit,
      remaining: Math.max(0, this.defaultLimit - entry.count),
      resetTime: entry.resetTime
    };
  }
}

// Create specific rate limiters
const anymailRateLimiter = new RateLimiter({
  defaultLimit: 100, // 100 requests
  defaultWindow: 60000 // per minute
});

const hubspotRateLimiter = new RateLimiter({
  defaultLimit: 100, // 100 requests
  defaultWindow: 10000 // per 10 seconds
});

const gmailRateLimiter = new RateLimiter({
  defaultLimit: 100, // 100 requests
  defaultWindow: 100000 // per 100 seconds (Gmail quota)
});

module.exports = {
  RateLimiter,
  anymailRateLimiter,
  hubspotRateLimiter,
  gmailRateLimiter
};

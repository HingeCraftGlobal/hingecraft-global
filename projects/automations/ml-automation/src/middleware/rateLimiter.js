/**
 * Express Rate Limiting Middleware
 * Protects API endpoints from abuse
 */

const { RateLimiter } = require('../utils/rateLimiter');

const apiRateLimiter = new RateLimiter({
  defaultLimit: 100, // 100 requests
  defaultWindow: 60000 // per minute
});

/**
 * Rate limiting middleware
 */
function rateLimitMiddleware(req, res, next) {
  const key = req.ip || req.connection.remoteAddress;
  const result = apiRateLimiter.isAllowed(key);

  if (!result.allowed) {
    res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${result.waitTime} seconds.`,
      retryAfter: result.waitTime
    });
    return;
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', apiRateLimiter.defaultLimit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  next();
}

module.exports = rateLimitMiddleware;

/**
 * Authentication & JWT Utilities
 * JWT token generation and validation
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

let jwtSecret = null;
let apiKey = null;

/**
 * Initialize JWT secret and API key
 */
function initAuth(secret, key) {
  jwtSecret = secret;
  apiKey = key;
}

/**
 * Generate JWT token
 */
function generateToken(user) {
  if (!jwtSecret) {
    throw new Error('JWT secret not initialized');
  }

  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };

  return jwt.sign(payload, jwtSecret);
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  if (!jwtSecret) {
    throw new Error('JWT secret not initialized');
  }

  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Extract token from Authorization header
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Validate Wix proxy signature
 */
function validateProxySignature(req) {
  if (!apiKey) {
    return false;
  }

  const signature = req.headers['x-proxy-signature'];
  if (!signature) {
    return false;
  }

  try {
    // Extract path, ts, nonce from signature header or body
    // For simplicity, we'll validate based on path + body
    const path = req.path;
    const body = JSON.stringify(req.body || {});
    const ts = req.headers['x-proxy-ts'];
    const nonce = req.headers['x-proxy-nonce'];

    if (!ts || !nonce) {
      return false;
    }

    // Check TTL (60 seconds)
    const requestTime = new Date(ts).getTime();
    const now = Date.now();
    if (Math.abs(now - requestTime) > 60000) {
      return false; // Signature expired
    }

    // Generate expected signature
    const payload = JSON.stringify({ path, ts, nonce });
    const expectedSignature = crypto
      .createHmac('sha256', apiKey)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Middleware to authenticate requests
 */
function authenticate(req, res, next) {
  try {
    // Check for Wix proxy signature first
    if (req.headers['x-wix-proxy'] === 'true') {
      if (validateProxySignature(req)) {
        // Proxy request authenticated - extract user from body or token
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);
        if (token) {
          const decoded = verifyToken(token);
          req.user = decoded;
          return next();
        }
        // If no token, allow anonymous proxy requests (for anon auth)
        return next();
      } else {
        return res.status(401).json({ error: 'Invalid proxy signature' });
      }
    }

    // Standard JWT authentication
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}

/**
 * Middleware to require admin role
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

/**
 * Middleware to require ownership or admin
 */
function requireOwnershipOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // If admin, allow
  if (req.user.role === 'admin') {
    return next();
  }

  // Check ownership (message user_id must match req.user.sub)
  // This is handled in route handlers
  next();
}

module.exports = {
  initAuth,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  validateProxySignature,
  authenticate,
  requireAdmin,
  requireOwnershipOrAdmin
};


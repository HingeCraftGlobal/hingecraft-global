/**
 * Authentication & JWT Utilities
 * JWT token generation and validation
 */

const jwt = require('jsonwebtoken');

let jwtSecret = null;

/**
 * Initialize JWT secret
 */
function initAuth(secret) {
  jwtSecret = secret;
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
 * Middleware to authenticate requests
 */
function authenticate(req, res, next) {
  try {
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
  authenticate,
  requireAdmin,
  requireOwnershipOrAdmin
};


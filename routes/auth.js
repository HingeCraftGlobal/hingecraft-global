/**
 * Authentication Routes
 * POST /api/auth/anon - Create anonymous session
 * GET /api/auth/identify - Identify existing user
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../lib/db');
const auth = require('../lib/auth');

/**
 * POST /api/auth/anon
 * Create anonymous user session
 */
router.post('/anon', async (req, res) => {
  try {
    const { name } = req.body;
    
    // Create user
    const userId = uuidv4();
    const user = await db.createUser({
      id: userId,
      name: name || `User_${Date.now()}`,
      email: null,
      avatar_url: null,
      role: 'user'
    });

    // Generate token
    const token = auth.generateToken(user);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Auth anon error:', error);
    res.status(500).json({ error: 'Failed to create anonymous session' });
  }
});

/**
 * GET /api/auth/identify
 * Identify user from token
 */
router.get('/identify', auth.authenticate, async (req, res) => {
  try {
    const userId = req.user.sub;
    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update last seen
    await db.updateUserLastSeen(userId);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Auth identify error:', error);
    res.status(500).json({ error: 'Failed to identify user' });
  }
});

module.exports = router;


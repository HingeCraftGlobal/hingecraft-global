/**
 * Search Routes
 * GET /api/messages/search - Full text search
 */

const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const auth = require('../lib/auth');

// Apply authentication to all routes
router.use(auth.authenticate);

/**
 * GET /api/messages/search
 * Search messages
 */
router.get('/', async (req, res) => {
  try {
    const { q, channel, since, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await db.searchMessages(q, {
      channel,
      since,
      limit: parseInt(limit) || 50
    });

    res.json({
      results,
      query: q,
      count: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

module.exports = router;






/**
 * Upload Routes
 * POST /api/uploads/request - Request upload URL
 * POST /api/uploads/complete - Complete upload
 */

const express = require('express');
const router = express.Router();
const uploads = require('../lib/uploads');
const db = require('../lib/db');
const auth = require('../lib/auth');
const idempotency = require('../lib/idempotency');

// Apply authentication to all routes
router.use(auth.authenticate);

/**
 * POST /api/uploads/request
 * Request upload URL
 */
router.post('/request', idempotency.idempotencyMiddleware, async (req, res) => {
  try {
    // Check idempotency
    const cachedResponse = await idempotency.checkIdempotency(
      req.idempotencyKey,
      req.path
    );
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const { filename, contentType, size, channel, messageTempId } = req.body;
    const userId = req.user.sub;

    // Validation
    if (!filename || !contentType || !size) {
      return res.status(400).json({ error: 'Filename, contentType, and size are required' });
    }

    if (size > 12 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size cannot exceed 12MB' });
    }

    // Request upload
    const uploadInfo = await uploads.requestUpload({
      filename,
      contentType,
      size,
      userId,
      channel,
      messageTempId
    });

    // Store idempotency response
    await idempotency.storeIdempotency(req.idempotencyKey, req.path, uploadInfo);

    res.json(uploadInfo);
  } catch (error) {
    console.error('Request upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to request upload' });
  }
});

/**
 * POST /api/uploads/complete
 * Complete upload
 */
router.post('/complete', async (req, res) => {
  try {
    const { uploadId, messageTempId } = req.body;

    if (!uploadId) {
      return res.status(400).json({ error: 'UploadId is required' });
    }

    // Complete upload
    const result = await uploads.completeUpload(uploadId, messageTempId);

    res.json(result);
  } catch (error) {
    console.error('Complete upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to complete upload' });
  }
});

module.exports = router;


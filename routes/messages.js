/**
 * Message Routes
 * CRUD operations for messages, reactions, pins, threads
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../lib/db');
const auth = require('../lib/auth');
const idempotency = require('../lib/idempotency');
const moderation = require('../lib/moderation');

// Apply authentication to all routes
router.use(auth.authenticate);

/**
 * POST /api/messages
 * Create new message
 */
router.post('/', idempotency.idempotencyMiddleware, async (req, res) => {
  try {
    // Check idempotency
    const cachedResponse = await idempotency.checkIdempotency(
      req.idempotencyKey,
      req.path
    );
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const { channel, text, parentId, attachments = [], clientTempId } = req.body;
    const userId = req.user.sub;

    // Validation
    if (!channel || !text) {
      return res.status(400).json({ error: 'Channel and text are required' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Message text cannot exceed 5000 characters' });
    }

    if (attachments.length > 10) {
      return res.status(400).json({ error: 'Cannot attach more than 10 files' });
    }

    const totalSize = attachments.reduce((sum, att) => sum + (att.size || 0), 0);
    if (totalSize > 12 * 1024 * 1024) {
      return res.status(400).json({ error: 'Total attachment size cannot exceed 12MB' });
    }

    // Create message
    const messageId = uuidv4();
    const message = await db.createMessage({
      id: messageId,
      channel,
      user_id: userId,
      text,
      parent_id: parentId || null,
      attachments,
      clientTempId
    });

    // Queue for moderation
    await moderation.queueForModeration(messageId, text);

    // Get full message with user info
    const fullMessage = await db.getMessageById(messageId);

    const response = {
      message: {
        id: fullMessage.id,
        channel: fullMessage.channel,
        user_id: fullMessage.user_id,
        text: fullMessage.text,
        ts: fullMessage.ts,
        parent_id: fullMessage.parent_id,
        attachments: typeof fullMessage.attachments === 'string' 
          ? JSON.parse(fullMessage.attachments) 
          : fullMessage.attachments,
        reactions: typeof fullMessage.reactions === 'string'
          ? JSON.parse(fullMessage.reactions)
          : fullMessage.reactions,
        pinned: fullMessage.pinned,
        edited: fullMessage.edited,
        user_name: fullMessage.user_name,
        user_avatar: fullMessage.user_avatar
      },
      clientTempId
    };

    // Store idempotency response
    await idempotency.storeIdempotency(req.idempotencyKey, req.path, response);

    // Emit WebSocket event (handled by server.js)
    req.app.get('io').to(channel).emit('message:new', {
      message: response.message,
      traceId: uuidv4()
    });

    res.json(response);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

/**
 * GET /api/messages
 * Get messages for channel
 */
router.get('/', async (req, res) => {
  try {
    const { channel, since, after, limit } = req.query;

    if (!channel) {
      return res.status(400).json({ error: 'Channel is required' });
    }

    const messages = await db.getMessages(channel, {
      since,
      after,
      limit: parseInt(limit) || 50
    });

    res.json({
      messages,
      total_count: messages.length,
      channel
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * POST /api/messages/:id/edit
 * Edit message
 */
router.post('/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.sub;

    if (!text || text.length > 5000) {
      return res.status(400).json({ error: 'Invalid text' });
    }

    // Get message
    const message = await db.getMessageById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check ownership or admin
    if (message.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }

    // Update message
    const updated = await db.updateMessage(id, text);
    const fullMessage = await db.getMessageById(id);

    // Emit WebSocket event
    req.app.get('io').to(message.channel).emit('message:edit', {
      message: {
        id: fullMessage.id,
        channel: fullMessage.channel,
        user_id: fullMessage.user_id,
        text: fullMessage.text,
        ts: fullMessage.ts,
        parent_id: fullMessage.parent_id,
        attachments: typeof fullMessage.attachments === 'string'
          ? JSON.parse(fullMessage.attachments)
          : fullMessage.attachments,
        reactions: typeof fullMessage.reactions === 'string'
          ? JSON.parse(fullMessage.reactions)
          : fullMessage.reactions,
        pinned: fullMessage.pinned,
        edited: fullMessage.edited,
        user_name: fullMessage.user_name,
        user_avatar: fullMessage.user_avatar
      },
      traceId: uuidv4()
    });

    res.json({ message: fullMessage });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

/**
 * POST /api/messages/:id/delete
 * Delete message
 */
router.post('/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    // Get message
    const message = await db.getMessageById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check ownership or admin
    if (message.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    // Delete message
    await db.deleteMessage(id);

    // Emit WebSocket event
    req.app.get('io').to(message.channel).emit('message:delete', {
      messageId: id,
      traceId: uuidv4()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

/**
 * POST /api/messages/:id/reaction
 * Toggle reaction
 */
router.post('/:id/reaction', async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.sub;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    // Get message
    const message = await db.getMessageById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Get current reactions
    let reactions = typeof message.reactions === 'string'
      ? JSON.parse(message.reactions)
      : message.reactions || {};

    // Toggle reaction
    const reactionKey = `${emoji}_${userId}`;
    if (reactions[reactionKey]) {
      delete reactions[reactionKey];
    } else {
      reactions[reactionKey] = {
        emoji,
        userId,
        ts: new Date().toISOString()
      };
    }

    // Update reactions
    await db.updateMessageReactions(id, reactions);

    // Emit WebSocket event
    req.app.get('io').to(message.channel).emit('reaction:update', {
      messageId: id,
      reactions,
      traceId: uuidv4()
    });

    res.json({ reactions });
  } catch (error) {
    console.error('Toggle reaction error:', error);
    res.status(500).json({ error: 'Failed to toggle reaction' });
  }
});

/**
 * POST /api/messages/:id/pin
 * Toggle pin (admin only)
 */
router.post('/:id/pin', auth.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get message
    const message = await db.getMessageById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Toggle pin
    const pinned = !message.pinned;
    await db.toggleMessagePin(id, pinned);

    // Emit WebSocket event
    req.app.get('io').to(message.channel).emit('pin:update', {
      messageId: id,
      pinned,
      traceId: uuidv4()
    });

    res.json({ pinned });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

/**
 * POST /api/messages/:id/read
 * Mark message as read
 */
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    await db.createReadReceipt(id, userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

/**
 * GET /api/messages/:id/thread
 * Get thread replies
 */
router.get('/:id/thread', async (req, res) => {
  try {
    const { id } = req.params;

    const replies = await db.getThreadReplies(id);

    res.json({ replies });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ error: 'Failed to get thread' });
  }
});

module.exports = router;


/**
 * Content Moderation
 * Asynchronous content moderation worker integration
 */

const Redis = require('ioredis');
const db = require('./db');

let redisClient = null;
let moderationQueue = null;

/**
 * Initialize moderation system
 */
function initModeration(redisUrl) {
  if (redisUrl) {
    redisClient = new Redis(redisUrl);
    moderationQueue = 'moderation_queue';
  }
}

/**
 * Check if message contains toxic content (basic implementation)
 * In production, integrate with 3rd party moderation API
 */
async function checkToxicity(text) {
  // Basic keyword-based moderation (replace with ML/API service)
  const toxicKeywords = [
    // Add your moderation keywords/rules here
  ];

  const lowerText = text.toLowerCase();
  const foundKeywords = toxicKeywords.filter(keyword => lowerText.includes(keyword.toLowerCase()));

  if (foundKeywords.length > 0) {
    return {
      flagged: true,
      score: foundKeywords.length * 0.3, // Simple scoring
      reason: `Contains inappropriate content: ${foundKeywords.join(', ')}`
    };
  }

  return {
    flagged: false,
    score: 0,
    reason: null
  };
}

/**
 * Queue message for moderation
 */
async function queueForModeration(messageId, text) {
  if (!redisClient || !moderationQueue) {
    // If Redis not available, moderate synchronously
    return await moderateMessage(messageId, text);
  }

  // Push to Redis stream for async processing
  await redisClient.xadd(
    moderationQueue,
    '*',
    'message_id', messageId,
    'text', text,
    'timestamp', Date.now()
  );

  return { queued: true };
}

/**
 * Moderate message (synchronous)
 */
async function moderateMessage(messageId, text) {
  const result = await checkToxicity(text);

  if (result.flagged) {
    // Update message status to 'held'
    await db.updateMessageStatus(messageId, 'held');

    // Create moderation log
    await db.createModerationLog({
      message_id: messageId,
      reason: result.reason,
      score: result.score,
      moderated_by: null // System moderation
    });

    // TODO: Notify moderators via admin channel
    // This would be done via WebSocket or notification system
  }

  return result;
}

/**
 * Process moderation queue (worker function)
 */
async function processModerationQueue() {
  if (!redisClient || !moderationQueue) {
    return;
  }

  try {
    // Read from stream
    const messages = await redisClient.xread('BLOCK', 1000, 'STREAMS', moderationQueue, '$');

    if (!messages || messages.length === 0) {
      return;
    }

    for (const stream of messages) {
      const [queueName, entries] = stream;

      for (const entry of entries) {
        const [id, fields] = entry;
        const messageId = fields.find(f => f[0] === 'message_id')?.[1];
        const text = fields.find(f => f[0] === 'text')?.[1];

        if (messageId && text) {
          await moderateMessage(messageId, text);
        }

        // Acknowledge processing
        await redisClient.xack(moderationQueue, 'moderation-group', id);
      }
    }
  } catch (error) {
    console.error('Moderation queue processing error:', error);
  }
}

/**
 * Start moderation worker (call in background)
 */
function startModerationWorker() {
  if (!redisClient) {
    console.log('Moderation worker not started: Redis not configured');
    return;
  }

  // Process queue every 5 seconds
  setInterval(() => {
    processModerationQueue().catch(error => {
      console.error('Moderation worker error:', error);
    });
  }, 5000);

  console.log('Moderation worker started');
}

/**
 * Approve held message (admin function)
 */
async function approveMessage(messageId, moderatorId) {
  await db.updateMessageStatus(messageId, 'active');
  
  await db.createModerationLog({
    message_id: messageId,
    reason: 'Approved by moderator',
    score: 0,
    moderated_by: moderatorId
  });
}

/**
 * Reject held message (admin function)
 */
async function rejectMessage(messageId, moderatorId, reason) {
  await db.updateMessageStatus(messageId, 'deleted');
  
  await db.createModerationLog({
    message_id: messageId,
    reason: reason || 'Rejected by moderator',
    score: 1.0,
    moderated_by: moderatorId
  });
}

module.exports = {
  initModeration,
  checkToxicity,
  queueForModeration,
  moderateMessage,
  processModerationQueue,
  startModerationWorker,
  approveMessage,
  rejectMessage
};


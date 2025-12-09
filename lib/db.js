/**
 * Database Connection & Query Helpers
 * PostgreSQL connection pool and query utilities
 */

const { Pool } = require('pg');

let pool = null;

/**
 * Initialize database connection pool
 */
function initDB(connectionString) {
  pool = new Pool({
    connectionString: connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
}

/**
 * Get database pool
 */
function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return pool;
}

/**
 * Execute query with error handling
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error: error.message });
    throw error;
  }
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

/**
 * Create user
 */
async function createUser(userData) {
  const { id, name, email, avatar_url, role = 'user' } = userData;
  const result = await query(
    `INSERT INTO users (id, name, email, avatar_url, role, created_at, last_seen)
     VALUES ($1, $2, $3, $4, $5, now(), now())
     RETURNING *`,
    [id, name, email, avatar_url, role]
  );
  return result.rows[0];
}

/**
 * Update user last seen
 */
async function updateUserLastSeen(userId) {
  await query(
    'UPDATE users SET last_seen = now() WHERE id = $1',
    [userId]
  );
}

/**
 * Get messages for channel
 */
async function getMessages(channel, options = {}) {
  const { since, after, limit = 50 } = options;
  let queryText = `
    SELECT m.*, u.name as user_name, u.avatar_url as user_avatar
    FROM messages m
    LEFT JOIN users u ON m.user_id = u.id
    WHERE m.channel = $1 AND m.status = 'active'
  `;
  const params = [channel];

  if (since) {
    queryText += ' AND m.ts > $2';
    params.push(since);
  }

  if (after) {
    queryText += ' AND m.ts < $2';
    params.push(after);
  }

  queryText += ' ORDER BY m.ts DESC LIMIT $' + (params.length + 1);
  params.push(limit);

  const result = await query(queryText, params);
  return result.rows.reverse(); // Return in chronological order
}

/**
 * Get message by ID
 */
async function getMessageById(messageId) {
  const result = await query(
    `SELECT m.*, u.name as user_name, u.avatar_url as user_avatar
     FROM messages m
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.id = $1`,
    [messageId]
  );
  return result.rows[0] || null;
}

/**
 * Create message
 */
async function createMessage(messageData) {
  const {
    id,
    channel,
    user_id,
    text,
    parent_id = null,
    attachments = [],
    clientTempId
  } = messageData;

  const result = await query(
    `INSERT INTO messages (id, channel, user_id, text, parent_id, attachments, ts)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     RETURNING *`,
    [id, channel, user_id, text, parent_id, JSON.stringify(attachments)]
  );

  // Create read receipt for author
  await query(
    `INSERT INTO read_receipts (message_id, user_id, ts)
     VALUES ($1, $2, now())
     ON CONFLICT (message_id, user_id) DO NOTHING`,
    [id, user_id]
  );

  return result.rows[0];
}

/**
 * Update message text
 */
async function updateMessage(messageId, text) {
  const result = await query(
    `UPDATE messages SET text = $1, edited = true WHERE id = $2 RETURNING *`,
    [text, messageId]
  );
  return result.rows[0] || null;
}

/**
 * Delete message (soft delete)
 */
async function deleteMessage(messageId) {
  const result = await query(
    `UPDATE messages SET status = 'deleted' WHERE id = $1 RETURNING *`,
    [messageId]
  );
  return result.rows[0] || null;
}

/**
 * Update message reactions
 */
async function updateMessageReactions(messageId, reactions) {
  const result = await query(
    `UPDATE messages SET reactions = $1 WHERE id = $2 RETURNING *`,
    [JSON.stringify(reactions), messageId]
  );
  return result.rows[0] || null;
}

/**
 * Toggle message pin
 */
async function toggleMessagePin(messageId, pinned) {
  const result = await query(
    `UPDATE messages SET pinned = $1 WHERE id = $2 RETURNING *`,
    [pinned, messageId]
  );
  return result.rows[0] || null;
}

/**
 * Get thread replies
 */
async function getThreadReplies(parentId) {
  const result = await query(
    `SELECT m.*, u.name as user_name, u.avatar_url as user_avatar
     FROM messages m
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.parent_id = $1 AND m.status = 'active'
     ORDER BY m.ts ASC`,
    [parentId]
  );
  return result.rows;
}

/**
 * Create read receipt
 */
async function createReadReceipt(messageId, userId) {
  await query(
    `INSERT INTO read_receipts (message_id, user_id, ts)
     VALUES ($1, $2, now())
     ON CONFLICT (message_id, user_id) DO UPDATE SET ts = now()`,
    [messageId, userId]
  );
}

/**
 * Search messages
 */
async function searchMessages(query, options = {}) {
  const { channel, limit = 50, since } = options;
  let queryText = `
    SELECT m.*, u.name as user_name, u.avatar_url as user_avatar,
           ts_rank(to_tsvector('english', coalesce(m.text, '')), plainto_tsquery('english', $1)) as rank
    FROM messages m
    LEFT JOIN users u ON m.user_id = u.id
    WHERE m.status = 'active'
      AND to_tsvector('english', coalesce(m.text, '')) @@ plainto_tsquery('english', $1)
  `;
  const params = [query];

  if (channel) {
    queryText += ' AND m.channel = $' + (params.length + 1);
    params.push(channel);
  }

  if (since) {
    queryText += ' AND m.ts > $' + (params.length + 1);
    params.push(since);
  }

  queryText += ' ORDER BY rank DESC, m.ts DESC LIMIT $' + (params.length + 1);
  params.push(limit);

  const result = await query(queryText, params);
  return result.rows;
}

/**
 * Create upload record
 */
async function createUpload(uploadData) {
  const {
    upload_id,
    user_id,
    filename,
    content_type,
    size,
    file_url,
    s3_key,
    expires_at
  } = uploadData;

  const result = await query(
    `INSERT INTO uploads (upload_id, user_id, filename, content_type, size, file_url, s3_key, status, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'requested', $8)
     RETURNING *`,
    [upload_id, user_id, filename, content_type, size, file_url, s3_key, expires_at]
  );
  return result.rows[0];
}

/**
 * Update upload status
 */
async function updateUploadStatus(uploadId, status, fileUrl = null) {
  const updates = ['status = $1'];
  const params = [status, uploadId];

  if (fileUrl) {
    updates.push('file_url = $' + (params.length + 1));
    params.splice(1, 0, fileUrl);
  }

  const result = await query(
    `UPDATE uploads SET ${updates.join(', ')} WHERE upload_id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

/**
 * Get upload by ID
 */
async function getUploadById(uploadId) {
  const result = await query('SELECT * FROM uploads WHERE upload_id = $1', [uploadId]);
  return result.rows[0] || null;
}

/**
 * Store idempotency key
 */
async function storeIdempotencyKey(key, path, response) {
  await query(
    `INSERT INTO idempotency_keys (key, path, response, created_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (key) DO NOTHING`,
    [key, path, JSON.stringify(response)]
  );
}

/**
 * Get idempotency key response
 */
async function getIdempotencyKeyResponse(key) {
  const result = await query(
    `SELECT response FROM idempotency_keys WHERE key = $1 AND created_at > now() - INTERVAL '24 hours'`,
    [key]
  );
  return result.rows[0]?.response || null;
}

/**
 * Create moderation log
 */
async function createModerationLog(logData) {
  const { message_id, reason, score, moderated_by } = logData;
  const result = await query(
    `INSERT INTO moderation_logs (message_id, reason, score, moderated_by, ts)
     VALUES ($1, $2, $3, $4, now())
     RETURNING *`,
    [message_id, reason, score, moderated_by]
  );
  return result.rows[0];
}

/**
 * Update message status (for moderation)
 */
async function updateMessageStatus(messageId, status) {
  const result = await query(
    `UPDATE messages SET status = $1 WHERE id = $2 RETURNING *`,
    [status, messageId]
  );
  return result.rows[0] || null;
}

/**
 * Close database connections
 */
async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  initDB,
  getPool,
  query,
  getUserById,
  getUserByEmail,
  createUser,
  updateUserLastSeen,
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  updateMessageReactions,
  toggleMessagePin,
  getThreadReplies,
  createReadReceipt,
  searchMessages,
  createUpload,
  updateUploadStatus,
  getUploadById,
  storeIdempotencyKey,
  getIdempotencyKeyResponse,
  createModerationLog,
  updateMessageStatus,
  close
};


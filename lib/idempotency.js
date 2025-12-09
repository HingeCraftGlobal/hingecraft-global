/**
 * Idempotency Handling
 * Prevents duplicate requests using idempotency keys
 */

const db = require('./db');
const { v4: uuidv4 } = require('uuid');

/**
 * Check idempotency and return cached response if exists
 */
async function checkIdempotency(key, path) {
  if (!key) {
    return null;
  }

  const cachedResponse = await db.getIdempotencyKeyResponse(key);
  if (cachedResponse) {
    return JSON.parse(cachedResponse);
  }

  return null;
}

/**
 * Store idempotency response
 */
async function storeIdempotency(key, path, response) {
  if (!key) {
    return;
  }

  await db.storeIdempotencyKey(key, path, response);
}

/**
 * Middleware to handle idempotency
 */
function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.headers['idempotency-key'];
  
  if (!idempotencyKey) {
    // Generate one if not provided
    req.idempotencyKey = uuidv4();
    return next();
  }

  req.idempotencyKey = idempotencyKey;
  
  // Check for cached response
  checkIdempotency(idempotencyKey, req.path)
    .then(cachedResponse => {
      if (cachedResponse) {
        return res.status(200).json(cachedResponse);
      }
      next();
    })
    .catch(error => {
      console.error('Idempotency check error:', error);
      next(); // Continue on error
    });
}

/**
 * Wrap response handler to store idempotency
 */
async function wrapWithIdempotency(req, handler) {
  const cachedResponse = await checkIdempotency(req.idempotencyKey, req.path);
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await handler();
  
  // Store response for idempotency
  await storeIdempotency(req.idempotencyKey, req.path, response);
  
  return response;
}

module.exports = {
  checkIdempotency,
  storeIdempotency,
  idempotencyMiddleware,
  wrapWithIdempotency
};


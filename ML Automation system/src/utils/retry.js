/**
 * Retry Utility
 * Implements exponential backoff retry logic
 */

const logger = require('./logger');

/**
 * Retry a function with exponential backoff
 */
async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    onRetry = null
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
        // Don't retry on 4xx errors (except 429)
        logger.warn(`Non-retryable error: ${error.statusCode}`);
        throw error;
      }

      if (onRetry) {
        onRetry(error, attempt + 1, delay);
      }

      logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error.message);
      
      await sleep(delay);
      delay = Math.min(delay * factor, maxDelay);
    }
  }

  logger.error(`All ${maxRetries + 1} attempts failed`);
  throw lastError;
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with circuit breaker pattern
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        logger.info('Circuit breaker: Moving to HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      logger.info('Circuit breaker: Moving to CLOSED state');
    }
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      logger.error(`Circuit breaker: Moving to OPEN state after ${this.failures} failures`);
    }
  }
}

module.exports = {
  retry,
  sleep,
  CircuitBreaker
};

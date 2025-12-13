/**
 * Database Sync Utility (HTTP-callable)
 * Same functionality as database-sync.jsw but accessible via HTTP
 */

import { verifyAllCollections, syncPaymentData, getDatabaseStats, cleanupExpiredPrefills } from 'backend/database-sync';

// Re-export all functions for HTTP access
export { verifyAllCollections, syncPaymentData, getDatabaseStats, cleanupExpiredPrefills };

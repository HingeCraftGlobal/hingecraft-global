/**
 * Worker Process
 * Runs scheduled reconciliation jobs
 */

require('dotenv').config();
const cron = require('node-cron');
const reconcile = require('./src/reconcile');

console.log('🔧 HingeCraft Payment Worker starting...');

// Run reconciliation immediately on start
(async () => {
  try {
    console.log('🔄 Running initial reconciliation...');
    await reconcile.runOnce();
    console.log('✅ Initial reconciliation complete');
  } catch (error) {
    console.error('❌ Initial reconciliation failed:', error);
  }
})();

// Schedule reconciliation every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    console.log('🔄 Running scheduled reconciliation...');
    await reconcile.runOnce();
    console.log('✅ Scheduled reconciliation complete');
  } catch (error) {
    console.error('❌ Scheduled reconciliation failed:', error);
  }
});

console.log('✅ Worker scheduled: reconciliation every 15 minutes');

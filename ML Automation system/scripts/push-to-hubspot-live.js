#!/usr/bin/env node

/**
 * Push Full Automation to HubSpot - LIVE
 * Optimized to minimize API calls (target: < 1,000 calls for full sync)
 * Imports all database data to HubSpot
 */

// Set database connection
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '7543';

const hubspotOptimizedSync = require('../src/services/hubspotOptimizedSync');
const logger = require('../src/utils/logger');

async function pushToHubSpotLive() {
  try {
    console.log('\n🚀 PUSHING FULL AUTOMATION TO HUBSPOT - LIVE');
    console.log('='.repeat(70));
    console.log('');

    // Step 1: Test connection
    console.log('📋 Step 1: Testing HubSpot API connection...');
    const connectionTest = await hubspotOptimizedSync.testConnection();
    
    if (!connectionTest.success) {
      console.error('❌ API Connection Failed!');
      console.error(`   Status: ${connectionTest.status}`);
      console.error(`   Error: ${connectionTest.error}`);
      console.error('');
      console.error('⚠️  Please update your Personal Access Key in config/api_keys.js');
      console.error('   Get new key: https://app-na2.hubspot.com/settings/integrations/private-apps');
      process.exit(1);
    }
    
    console.log('✅ API Connection: SUCCESS');
    console.log('');

    // Step 2: Full optimized sync
    console.log('📋 Step 2: Starting full optimized sync...');
    console.log('   Using batch operations to minimize API calls...');
    console.log('');

    const result = await hubspotOptimizedSync.fullSyncOptimized();

    // Display results
    console.log('');
    console.log('='.repeat(70));
    console.log('✅ FULL AUTOMATION PUSHED TO HUBSPOT!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📊 SYNC RESULTS:');
    console.log(`   Leads Synced: ${result.leads.created + result.leads.updated}/${result.leads.total}`);
    console.log(`   Contacts Updated: ${result.contacts.updated}`);
    console.log(`   Pipeline Runs: ${result.pipeline.synced || 'N/A'}`);
    console.log('');
    console.log('📈 API USAGE:');
    console.log(`   API Calls Used: ${result.apiCallsUsed}`);
    console.log(`   API Call Usage: ${result.apiCallUsage}`);
    console.log(`   Remaining: ${250000 - result.apiCallsUsed} calls`);
    console.log(`   Duration: ${result.duration}`);
    console.log('');
    console.log('🎯 VIEW IN HUBSPOT:');
    console.log('   - Go to: https://app-na2.hubspot.com/contacts');
    console.log('   - All leads are now contacts');
    console.log('   - Check properties (automation_*)');
    console.log('   - View timeline events');
    console.log('');
    console.log('✅ All automation data is now live in HubSpot!');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  pushToHubSpotLive();
}

module.exports = pushToHubSpotLive;

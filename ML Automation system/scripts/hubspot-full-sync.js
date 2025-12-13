#!/usr/bin/env node

/**
 * HubSpot Full Sync Script
 * Syncs all automation data to HubSpot using Personal Access Key
 */

// Set database connection
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '7543';

const hubspotCLISync = require('../src/services/hubspotCLISync');
const logger = require('../src/utils/logger');

async function fullSync() {
  try {
    console.log('\n🚀 HUBSPOT FULL SYNC');
    console.log('='.repeat(70));
    console.log('Syncing all automation data to HubSpot...');
    console.log('');

    const result = await hubspotCLISync.fullSync();

    console.log('');
    console.log('='.repeat(70));
    console.log('✅ FULL SYNC COMPLETE!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Properties Created: ${result.properties?.created?.length || 0}`);
    console.log(`   Leads Synced: ${result.leads?.synced || 0}`);
    console.log(`   Leads Failed: ${result.leads?.failed || 0}`);
    console.log(`   Metrics Synced: ${result.metrics?.synced ? 'Yes' : 'No'}`);
    console.log('');
    console.log('🎯 View in HubSpot:');
    console.log('   - Go to Contacts to see all synced leads');
    console.log('   - Check contact properties (automation_*)');
    console.log('   - View timeline events');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  fullSync();
}

module.exports = fullSync;

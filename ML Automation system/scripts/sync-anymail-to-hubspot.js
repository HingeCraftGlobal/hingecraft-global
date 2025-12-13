#!/usr/bin/env node

/**
 * Sync All AnyMail Contacts to HubSpot
 * Syncs all contacts from AnyMail to HubSpot
 */

// Set database connection
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '7543';

const anymailToHubspotSync = require('../src/services/anymailToHubspotSync');
const logger = require('../src/utils/logger');

async function syncAnymailToHubspot() {
  try {
    console.log('\n🚀 SYNCING ANYMAIL → HUBSPOT');
    console.log('='.repeat(70));
    console.log('');

    const result = await anymailToHubspotSync.syncAllAnymailContactsToHubspot();

    console.log('');
    console.log('='.repeat(70));
    console.log('✅ SYNC COMPLETE!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📊 Results:');
    console.log(`   AnyMail Contacts: ${result.anymail_contacts}`);
    console.log(`   Leads Created: ${result.leads_created}`);
    console.log(`   HubSpot Synced: ${result.hubspot_synced}`);
    if (result.failed > 0) {
      console.log(`   Failed: ${result.failed}`);
    }
    console.log('');
    console.log('🎯 View in HubSpot:');
    console.log('   - Contacts: https://app-na2.hubspot.com/contacts');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  syncAnymailToHubspot();
}

module.exports = syncAnymailToHubspot;

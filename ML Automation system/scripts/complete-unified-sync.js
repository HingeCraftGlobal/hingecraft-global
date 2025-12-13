#!/usr/bin/env node

/**
 * Complete Unified Sync
 * Ensures all data flows from database → HubSpot and is visible
 */

// Set database connection
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '7543';

const hubspotUnifiedSync = require('../src/services/hubspotUnifiedSync');
const logger = require('../src/utils/logger');

async function runCompleteUnifiedSync() {
  try {
    console.log('\n🚀 COMPLETE UNIFIED HUBSPOT SYNC');
    console.log('='.repeat(70));
    console.log('Ensuring all data flows to HubSpot and contacts are visible...');
    console.log('');

    const result = await hubspotUnifiedSync.completeUnifiedSync();

    console.log('');
    console.log('='.repeat(70));
    console.log('✅ UNIFIED SYNC COMPLETE!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📊 Results:');
    console.log(`   Properties: ${result.properties.created + result.properties.existing} total`);
    console.log(`   Leads Synced: ${result.leads.created + result.leads.updated}/${result.leads.total}`);
    console.log(`   Contacts Updated: ${result.contacts.updated}`);
    console.log(`   Segments Synced: ${result.segments.synced} lists created`);
    console.log(`   Contacts in HubSpot: ${result.verification.count} visible`);
    console.log(`   API Calls Used: ${result.apiCallsUsed}`);
    console.log(`   API Usage: ${((result.apiCallsUsed / 250000) * 100).toFixed(3)}%`);
    console.log('');
    
    if (result.verification.sample && result.verification.sample.length > 0) {
      console.log('📋 Sample Contacts in HubSpot:');
      result.verification.sample.forEach(contact => {
        console.log(`   - ${contact.name || 'N/A'} (${contact.email}) - Type: ${contact.leadType || 'N/A'}`);
      });
      console.log('');
    }

    console.log('🎯 View in HubSpot:');
    console.log('   - Contacts: https://app-na2.hubspot.com/contacts');
    console.log('   - Lists: https://app-na2.hubspot.com/contacts/lists');
    console.log('   - Properties: https://app-na2.hubspot.com/settings/contacts/properties');
    console.log('');
    console.log('✅ All data is now flowing and visible in HubSpot!');
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
  runCompleteUnifiedSync();
}

module.exports = runCompleteUnifiedSync;

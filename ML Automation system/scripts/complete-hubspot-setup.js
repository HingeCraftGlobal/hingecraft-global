#!/usr/bin/env node

/**
 * Complete HubSpot Setup
 * Creates all properties, syncs all data, and sets up complete CRM integration
 */

// Set database connection
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '7543';

const hubspotCompleteSetup = require('../src/services/hubspotCompleteSetup');
const logger = require('../src/utils/logger');

async function completeSetup() {
  try {
    console.log('\n🚀 COMPLETE HUBSPOT SETUP');
    console.log('='.repeat(70));
    console.log('Creating all properties, syncing all data, and setting up CRM...');
    console.log('');

    const result = await hubspotCompleteSetup.completeSetup();

    console.log('');
    console.log('='.repeat(70));
    console.log('✅ COMPLETE SETUP FINISHED!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📊 SETUP RESULTS:');
    console.log(`   Properties Created: ${result.properties.created}`);
    console.log(`   Properties Existing: ${result.properties.existing}`);
    console.log(`   Leads Synced: ${result.leads.synced}/${result.leads.total}`);
    console.log(`   Contacts Updated: ${result.contacts.updated}`);
    console.log('');
    console.log('📈 API USAGE:');
    console.log(`   API Calls Used: ${result.apiCallsUsed}`);
    console.log(`   API Call Usage: ${result.apiCallUsage}`);
    console.log(`   Remaining: ${250000 - result.apiCallsUsed} calls`);
    console.log('');
    console.log('🎯 VIEW IN HUBSPOT:');
    console.log('   - Contacts: https://app-na2.hubspot.com/contacts');
    console.log('   - Properties: https://app-na2.hubspot.com/settings/contacts/properties');
    console.log('   - All automation properties are now available');
    console.log('');
    console.log('✅ HubSpot CRM is now fully set up and synced!');
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
  completeSetup();
}

module.exports = completeSetup;

/**
 * Automate HubSpot Setup
 * Pushes all properties, syncs all data, creates list workflows
 * Everything that CAN be automated via API
 */

require('dotenv').config();
const hubspotListMaintenance = require('../src/services/hubspotListMaintenance');
const hubspotListWorkflows = require('../src/services/hubspotListWorkflows');
const logger = require('../src/utils/logger');

async function automateHubSpotSetup() {
  try {
    console.log('');
    console.log('='.repeat(80));
    console.log('  HUBSPOT AUTOMATED SETUP');
    console.log('  (Everything that can be automated via API)');
    console.log('='.repeat(80));
    console.log('');

    const results = {
      properties: null,
      dataSync: null,
      workflows: null
    };

    // Step 1: Push ALL properties
    console.log('📋 Step 1: Pushing ALL properties from database...');
    try {
      results.properties = await hubspotListMaintenance.pushAllProperties();
      console.log(`   ✅ Properties: ${results.properties.created.length} created, ${results.properties.existing.length} existing`);
      if (results.properties.failed.length > 0) {
        console.log(`   ⚠️  Failed: ${results.properties.failed.length}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.properties = { error: error.message };
    }

    console.log('');

    // Step 2: Sync ALL data
    console.log('📋 Step 2: Syncing ALL database data to HubSpot...');
    try {
      results.dataSync = await hubspotListMaintenance.syncAllDataForListMaintenance();
      console.log(`   ✅ Synced: ${results.dataSync.created} created, ${results.dataSync.updated} updated`);
      if (results.dataSync.failed > 0) {
        console.log(`   ⚠️  Failed: ${results.dataSync.failed}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.dataSync = { error: error.message };
    }

    console.log('');

    // Step 3: Create list workflows
    console.log('📋 Step 3: Creating list maintenance workflows...');
    try {
      results.workflows = await hubspotListWorkflows.createAllListWorkflows();
      console.log(`   ✅ Workflows: ${results.workflows.successful}/${results.workflows.total} created`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.workflows = { error: error.message };
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('  ✅ AUTOMATED SETUP COMPLETE');
    console.log('='.repeat(80));
    console.log('');

    // Summary
    console.log('📊 Summary:');
    console.log(`   Properties: ${results.properties?.created?.length || 0} created`);
    console.log(`   Contacts: ${results.dataSync?.created + results.dataSync?.updated || 0} synced`);
    console.log(`   Workflows: ${results.workflows?.successful || 0} created`);
    console.log('');

    // Manual steps reminder
    console.log('📝 Manual Steps Remaining:');
    console.log('   1. Verify all properties in HubSpot UI');
    console.log('   2. Verify all lists are created');
    console.log('   3. Verify workflows are active');
    console.log('   4. Test list population');
    console.log('');

    return results;
  } catch (error) {
    logger.error('Error in automated setup:', error);
    console.error('');
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  automateHubSpotSetup()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { automateHubSpotSetup };

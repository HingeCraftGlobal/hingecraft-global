/**
 * Complete HubSpot Sync with CLI
 * Ensures all data is synced using both API and CLI
 */

require('dotenv').config();
const { execSync } = require('child_process');
const hubspotCompleteDataSync = require('../src/services/hubspotCompleteDataSync');
const hubspotWorkflowWebhook = require('../src/services/hubspotWorkflowWebhook');
const hubspotCLISync = require('../src/services/hubspotCLISync');
const logger = require('../src/utils/logger');
const config = require('../config/api_keys');

async function completeHubSpotSync() {
  try {
    logger.info('🚀 Starting COMPLETE HubSpot Sync (API + CLI)');
    console.log('');
    console.log('='.repeat(60));
    console.log('  COMPLETE HUBSPOT SYNC');
    console.log('='.repeat(60));
    console.log('');

    // Step 1: Check HubSpot CLI
    console.log('📋 Step 1: Checking HubSpot CLI...');
    try {
      const cliVersion = execSync('hs --version', { encoding: 'utf-8' }).trim();
      console.log(`   ✅ HubSpot CLI installed: ${cliVersion}`);
    } catch (error) {
      console.log('   ⚠️  HubSpot CLI not found. Install with: npm install -g @hubspot/cli');
      console.log('   Continuing with API-only sync...');
    }

    // Step 2: Complete data sync via API
    console.log('');
    console.log('📋 Step 2: Syncing ALL data via API...');
    const apiSyncResult = await hubspotCompleteDataSync.completeDataSync();
    
    console.log('');
    console.log('✅ API Sync Results:');
    console.log(`   Leads: ${apiSyncResult.summary.syncedLeads}/${apiSyncResult.summary.totalLeads}`);
    console.log(`   Properties: ${apiSyncResult.summary.totalProperties}`);
    console.log(`   Segments: ${apiSyncResult.summary.totalSegments}`);
    console.log(`   Templates: ${apiSyncResult.summary.totalTemplates}`);

    // Step 3: Sync via CLI (if available)
    console.log('');
    console.log('📋 Step 3: Syncing via HubSpot CLI...');
    try {
      const cliResult = await hubspotCLISync.syncAll();
      console.log('   ✅ CLI sync completed');
    } catch (error) {
      console.log(`   ⚠️  CLI sync failed: ${error.message}`);
      console.log('   Continuing...');
    }

    // Step 4: Setup workflows
    console.log('');
    console.log('📋 Step 4: Setting up HubSpot workflows...');
    const workflowResult = await hubspotWorkflowWebhook.setupDefaultWorkflows();
    if (workflowResult.success) {
      console.log(`   ✅ Created ${workflowResult.workflows.length} workflows`);
    } else {
      console.log(`   ⚠️  Workflow setup failed: ${workflowResult.error}`);
    }

    // Step 5: Setup webhook subscription
    console.log('');
    console.log('📋 Step 5: Setting up HubSpot webhook subscription...');
    const webhookUrl = hubspotWorkflowWebhook.getWebhookUrl();
    console.log(`   Webhook URL: ${webhookUrl}`);
    
    const webhookResult = await hubspotWorkflowWebhook.createWebhookSubscription(
      webhookUrl,
      ['contact.creation', 'contact.propertyChange', 'contact.deletion']
    );
    
    if (webhookResult.success) {
      console.log(`   ✅ Webhook subscription created: ${webhookResult.subscriptionId}`);
    } else {
      console.log(`   ⚠️  Webhook setup failed: ${webhookResult.error}`);
      console.log('   You may need to set this up manually in HubSpot');
    }

    // Step 6: Verification
    console.log('');
    console.log('📋 Step 6: Final verification...');
    const verification = apiSyncResult.verification;
    console.log(`   ✅ Contacts in HubSpot: ${verification.contacts}`);
    console.log(`   ✅ Properties: ${verification.properties}`);
    console.log(`   ✅ Database leads: ${verification.dbLeads}`);

    console.log('');
    console.log('='.repeat(60));
    console.log('  ✅ COMPLETE SYNC FINISHED');
    console.log('='.repeat(60));
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Total leads synced: ${apiSyncResult.summary.syncedLeads}`);
    console.log(`   HubSpot contacts: ${verification.contacts}`);
    console.log(`   Properties created: ${apiSyncResult.summary.totalProperties}`);
    console.log(`   Workflows: ${workflowResult.workflows?.length || 0}`);
    console.log(`   Webhook: ${webhookResult.success ? 'Configured' : 'Manual setup needed'}`);
    console.log('');

    return {
      success: true,
      apiSync: apiSyncResult,
      workflows: workflowResult,
      webhook: webhookResult,
      verification
    };
  } catch (error) {
    logger.error('Error in complete HubSpot sync:', error);
    console.error('');
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  completeHubSpotSync()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { completeHubSpotSync };

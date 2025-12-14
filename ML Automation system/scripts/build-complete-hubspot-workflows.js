/**
 * Build Complete HubSpot Workflows from Database
 * Constructs entire workflow system using HubSpot Dev Mode
 */

require('dotenv').config();
const hubspotCompleteWorkflowBuilder = require('../src/services/hubspotCompleteWorkflowBuilder');
const logger = require('../src/utils/logger');

async function buildWorkflows() {
  try {
    console.log('');
    console.log('🚀 Building Complete HubSpot Workflow System');
    console.log('   Using entire database schema');
    console.log('   HubSpot Dev Mode: Custom Apps, Serverless Functions, Workflows');
    console.log('');

    const results = await hubspotCompleteWorkflowBuilder.buildCompleteWorkflowSystem();

    console.log('');
    console.log('📊 BUILD SUMMARY');
    console.log('─'.repeat(80));
    console.log(`   Properties: ${results.properties.total} mapped`);
    console.log(`   Workflows: ${results.workflows.total} created`);
    console.log(`   Serverless Functions: ${results.serverlessFunctions.total} configured`);
    console.log(`   Custom Apps: ${results.customApps.total} configured`);
    console.log(`   Webhooks: ${results.webhooks.configured}/${results.webhooks.total} configured`);
    console.log(`   Lists: ${results.lists.total} defined`);
    console.log('');

    // Save configuration
    const fs = require('fs');
    fs.writeFileSync(
      'hubspot-workflow-system-config.json',
      JSON.stringify(results, null, 2)
    );
    console.log('📄 Configuration saved to: hubspot-workflow-system-config.json');
    console.log('');

    return results;
  } catch (error) {
    logger.error('Error building workflows:', error);
    console.error('');
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  buildWorkflows()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { buildWorkflows };

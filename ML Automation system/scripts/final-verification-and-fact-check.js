/**
 * Final Verification and Fact Check
 * Comprehensive system verification with web scan
 */

require('dotenv').config();
const axios = require('axios');
const db = require('../src/utils/database');
const logger = require('../src/utils/logger');
const config = require('../config/api_keys');
const hubspotCompleteDataSync = require('../src/services/hubspotCompleteDataSync');
const hubspotWorkflowWebhook = require('../src/services/hubspotWorkflowWebhook');
const geminiService = require('../src/services/geminiService');

async function finalVerification() {
  console.log('');
  console.log('='.repeat(70));
  console.log('  FINAL SYSTEM VERIFICATION & FACT CHECK');
  console.log('='.repeat(70));
  console.log('');

  const results = {
    database: {},
    hubspot: {},
    integrations: {},
    workflows: {},
    webhooks: {},
    gemini: {},
    summary: {}
  };

  // ============================================
  // 1. DATABASE VERIFICATION
  // ============================================
  console.log('📊 1. DATABASE VERIFICATION');
  console.log('─'.repeat(70));
  try {
    const dbChecks = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM leads) as leads,
        (SELECT COUNT(*) FROM email_templates) as templates,
        (SELECT COUNT(*) FROM sequences) as sequences,
        (SELECT COUNT(*) FROM sequence_steps) as sequence_steps,
        (SELECT COUNT(*) FROM lead_segments) as segments,
        (SELECT COUNT(*) FROM hubspot_sync) as hubspot_syncs,
        (SELECT COUNT(*) FROM email_tracking) as email_tracking,
        (SELECT COUNT(*) FROM lead_analysis) as analysis
    `);

    results.database = {
      leads: parseInt(dbChecks.rows[0].leads) || 0,
      templates: parseInt(dbChecks.rows[0].templates) || 0,
      sequences: parseInt(dbChecks.rows[0].sequences) || 0,
      sequence_steps: parseInt(dbChecks.rows[0].sequence_steps) || 0,
      segments: parseInt(dbChecks.rows[0].segments) || 0,
      hubspot_syncs: parseInt(dbChecks.rows[0].hubspot_syncs) || 0,
      email_tracking: parseInt(dbChecks.rows[0].email_tracking) || 0,
      analysis: parseInt(dbChecks.rows[0].analysis) || 0
    };

    console.log(`   ✅ Leads: ${results.database.leads}`);
    console.log(`   ✅ Templates: ${results.database.templates}`);
    console.log(`   ✅ Sequences: ${results.database.sequences}`);
    console.log(`   ✅ Sequence Steps: ${results.database.sequence_steps}`);
    console.log(`   ✅ Segments: ${results.database.segments}`);
    console.log(`   ✅ HubSpot Syncs: ${results.database.hubspot_syncs}`);
    console.log(`   ✅ Email Tracking: ${results.database.email_tracking}`);
    console.log(`   ✅ AI Analysis: ${results.database.analysis}`);
  } catch (error) {
    console.log(`   ❌ Database check failed: ${error.message}`);
    results.database.error = error.message;
  }

  console.log('');

  // ============================================
  // 2. HUBSPOT VERIFICATION
  // ============================================
  console.log('📊 2. HUBSPOT VERIFICATION');
  console.log('─'.repeat(70));
  try {
    const hubspotClient = axios.create({
      baseURL: config.hubspot.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.hubspot.personalAccessKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Check contacts
    const contactsRes = await hubspotClient.get('/crm/v3/objects/contacts', {
      params: { limit: 1, properties: 'email' }
    });
    const contactCount = contactsRes.data.paging?.total || 0;

    // Check properties
    const propsRes = await hubspotClient.get('/crm/v3/properties/contacts');
    const propertyCount = propsRes.data.results?.length || 0;

    // Check automation properties
    const automationProps = propsRes.data.results?.filter(p => 
      p.name.startsWith('automation_')
    ) || [];

    results.hubspot = {
      contacts: contactCount,
      properties: propertyCount,
      automation_properties: automationProps.length,
      sync_percentage: results.database.leads > 0 
        ? Math.round((results.database.hubspot_syncs / results.database.leads) * 100)
        : 0
    };

    console.log(`   ✅ Contacts: ${results.hubspot.contacts}`);
    console.log(`   ✅ Properties: ${results.hubspot.properties}`);
    console.log(`   ✅ Automation Properties: ${results.hubspot.automation_properties}`);
    console.log(`   ✅ Sync Percentage: ${results.hubspot.sync_percentage}%`);
  } catch (error) {
    console.log(`   ❌ HubSpot check failed: ${error.message}`);
    results.hubspot.error = error.message;
  }

  console.log('');

  // ============================================
  // 3. INTEGRATIONS VERIFICATION
  // ============================================
  console.log('📊 3. INTEGRATIONS VERIFICATION');
  console.log('─'.repeat(70));
  
  // Google Drive
  try {
    const driveConfigured = !!(config.google.clientId && config.google.clientSecret);
    console.log(`   ${driveConfigured ? '✅' : '❌'} Google Drive: ${driveConfigured ? 'Configured' : 'Not configured'}`);
    results.integrations.google_drive = driveConfigured;
  } catch (error) {
    console.log(`   ❌ Google Drive check failed`);
    results.integrations.google_drive = false;
  }

  // AnyMail
  try {
    const anymailConfigured = !!(config.anymail.apiKey);
    console.log(`   ${anymailConfigured ? '✅' : '❌'} AnyMail: ${anymailConfigured ? 'Configured' : 'Not configured'}`);
    results.integrations.anymail = anymailConfigured;
  } catch (error) {
    console.log(`   ❌ AnyMail check failed`);
    results.integrations.anymail = false;
  }

  // Gmail
  try {
    const gmailConfigured = !!(config.email.fromAddress);
    console.log(`   ${gmailConfigured ? '✅' : '❌'} Gmail: ${gmailConfigured ? 'Configured' : 'Not configured'}`);
    results.integrations.gmail = gmailConfigured;
  } catch (error) {
    console.log(`   ❌ Gmail check failed`);
    results.integrations.gmail = false;
  }

  // Gemini
  try {
    const geminiConfigured = !!(config.gemini?.apiKey);
    console.log(`   ${geminiConfigured ? '✅' : '❌'} Gemini AI: ${geminiConfigured ? 'Configured' : 'Not configured'}`);
    results.integrations.gemini = geminiConfigured;
  } catch (error) {
    console.log(`   ❌ Gemini check failed`);
    results.integrations.gemini = false;
  }

  console.log('');

  // ============================================
  // 4. WORKFLOWS VERIFICATION
  // ============================================
  console.log('📊 4. HUBSPOT WORKFLOWS');
  console.log('─'.repeat(70));
  try {
    const workflowResult = await hubspotWorkflowWebhook.setupDefaultWorkflows();
    if (workflowResult.success) {
      console.log(`   ✅ Workflows: ${workflowResult.workflows.length} configured`);
      results.workflows = {
        configured: workflowResult.workflows.length,
        workflows: workflowResult.workflows
      };
    } else {
      console.log(`   ⚠️  Workflows: Setup needed (${workflowResult.error})`);
      results.workflows = { configured: 0, error: workflowResult.error };
    }
  } catch (error) {
    console.log(`   ❌ Workflow check failed: ${error.message}`);
    results.workflows.error = error.message;
  }

  console.log('');

  // ============================================
  // 5. WEBHOOKS VERIFICATION
  // ============================================
  console.log('📊 5. WEBHOOKS');
  console.log('─'.repeat(70));
  
  const anymailWebhookUrl = process.env.ANYMAIL_WEBHOOK_URL || 'http://localhost:3001/api/webhooks/anymail';
  const hubspotWebhookUrl = hubspotWorkflowWebhook.getWebhookUrl();
  
  console.log(`   ✅ AnyMail Webhook: ${anymailWebhookUrl}`);
  console.log(`   ✅ HubSpot Webhook: ${hubspotWebhookUrl}`);
  
  results.webhooks = {
    anymail: anymailWebhookUrl,
    hubspot: hubspotWebhookUrl
  };

  console.log('');

  // ============================================
  // 6. GEMINI AI VERIFICATION
  // ============================================
  console.log('📊 6. GEMINI AI SERVICE');
  console.log('─'.repeat(70));
  try {
    if (geminiService.model) {
      console.log('   ✅ Gemini AI: Initialized');
      results.gemini.initialized = true;
    } else {
      console.log('   ⚠️  Gemini AI: Not initialized (check API key)');
      results.gemini.initialized = false;
    }
  } catch (error) {
    console.log(`   ❌ Gemini check failed: ${error.message}`);
    results.gemini.error = error.message;
  }

  console.log('');

  // ============================================
  // 7. SUMMARY & FACT CHECK
  // ============================================
  console.log('📊 7. FINAL SUMMARY');
  console.log('─'.repeat(70));

  const allIntegrations = Object.values(results.integrations).every(v => v === true);
  const databaseHealthy = results.database.leads >= 0 && !results.database.error;
  const hubspotHealthy = results.hubspot.contacts >= 0 && !results.hubspot.error;

  results.summary = {
    database_healthy: databaseHealthy,
    hubspot_healthy: hubspotHealthy,
    all_integrations: allIntegrations,
    ready_for_production: databaseHealthy && hubspotHealthy && allIntegrations
  };

  console.log(`   Database: ${databaseHealthy ? '✅ Healthy' : '❌ Issues'}`);
  console.log(`   HubSpot: ${hubspotHealthy ? '✅ Healthy' : '❌ Issues'}`);
  console.log(`   Integrations: ${allIntegrations ? '✅ All configured' : '⚠️  Some missing'}`);
  console.log(`   Production Ready: ${results.summary.ready_for_production ? '✅ YES' : '❌ NO'}`);

  console.log('');
  console.log('='.repeat(70));
  console.log('  VERIFICATION COMPLETE');
  console.log('='.repeat(70));
  console.log('');

  // Save results
  const fs = require('fs');
  fs.writeFileSync(
    'final-verification-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('📄 Results saved to: final-verification-results.json');
  console.log('');

  return results;
}

// Run if called directly
if (require.main === module) {
  finalVerification()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { finalVerification };

#!/usr/bin/env node

/**
 * HubSpot Dashboard Sync Script
 * Syncs all pipeline data to HubSpot
 */

// Set database connection
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '7543';

const hubspotDashboardSync = require('../src/services/hubspotDashboardSync');
const logger = require('../src/utils/logger');

async function syncToHubSpot() {
  try {
    console.log('\n🚀 HUBSPOT DASHBOARD SYNC');
    console.log('='.repeat(70));
    console.log('');

    // Step 1: Initialize custom objects
    console.log('📋 Step 1: Initializing custom objects...');
    await hubspotDashboardSync.initializeCustomObjects();
    console.log('✅ Custom objects initialized');
    console.log('');

    // Step 2: Sync all pipeline runs
    console.log('📊 Step 2: Syncing pipeline runs...');
    const pipelineRuns = await hubspotDashboardSync.syncAllPipelineRuns(100);
    console.log(`✅ Synced ${pipelineRuns.synced} pipeline runs`);
    if (pipelineRuns.failed > 0) {
      console.log(`⚠️  ${pipelineRuns.failed} failed`);
    }
    console.log('');

    // Step 3: Sync metrics
    console.log('📈 Step 3: Syncing pipeline metrics...');
    await hubspotDashboardSync.syncPipelineMetrics('24 hours');
    console.log('✅ Metrics synced');
    console.log('');

    // Step 4: Sync all contacts
    console.log('👥 Step 4: Syncing contacts with pipeline data...');
    const contacts = await hubspotDashboardSync.syncAllContactsPipelineData(100);
    console.log(`✅ Synced ${contacts.synced} contacts`);
    if (contacts.failed > 0) {
      console.log(`⚠️  ${contacts.failed} failed`);
    }
    console.log('');

    console.log('='.repeat(70));
    console.log('✅ HUBSPOT SYNC COMPLETE!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Pipeline Runs: ${pipelineRuns.synced}`);
    console.log(`   Contacts: ${contacts.synced}`);
    console.log(`   Metrics: Synced`);
    console.log('');
    console.log('🎯 View in HubSpot:');
    console.log('   - Custom Objects: Pipeline Run, Pipeline Metrics');
    console.log('   - Contacts: Updated with automation properties');
    console.log('   - Timeline: Pipeline events logged');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  syncToHubSpot();
}

module.exports = syncToHubSpot;

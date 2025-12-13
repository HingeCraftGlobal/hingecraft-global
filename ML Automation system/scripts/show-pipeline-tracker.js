#!/usr/bin/env node

/**
 * Quick Pipeline Tracker Display
 * Shows current pipeline tracker status in a formatted way
 */

// Set database connection
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '7543';

const pipelineTracker = require('../src/services/pipelineTracker');

async function showTracker() {
  try {
    // Perform full sync check
    await pipelineTracker.performFullSyncCheck();
    
    // Get status
    const status = await pipelineTracker.getStatus();
    
    // Get metrics
    let metrics = null;
    try {
      metrics = await pipelineTracker.getMetrics('24 hours');
    } catch (e) {
      // Metrics might fail, continue without them
    }
    
    // Display
    console.log('\n📊 PIPELINE TRACKER STATUS');
    console.log('='.repeat(70));
    console.log(`Tracker Running: ${status.tracker.running ? '✅ YES' : '❌ NO'}`);
    console.log(`Last Sync Check: ${new Date(status.tracker.lastSyncCheck).toLocaleString()}`);
    console.log('');
    
    console.log('🔄 SYNC STATUS');
    console.log('-'.repeat(70));
    console.log(`Database: ${status.sync.database.synced ? '✅ SYNCED' : '❌ NOT SYNCED'}`);
    if (status.sync.database.details) {
      console.log(`  Tables: ${status.sync.database.details.tables.existing}/${status.sync.database.details.tables.required}`);
      console.log(`  Indexes: ${status.sync.database.details.indexes.existing}/${status.sync.database.details.indexes.required}`);
      console.log(`  Triggers: ${status.sync.database.details.triggers.existing}/${status.sync.database.details.triggers.required}`);
    }
    if (status.sync.database.errors.length > 0) {
      console.log(`  Errors: ${status.sync.database.errors.join(', ')}`);
    }
    
    console.log(`Files: ${status.sync.files.synced ? '✅ SYNCED' : '❌ NOT SYNCED'}`);
    if (status.sync.files.details) {
      console.log(`  Files: ${status.sync.files.details.existing}/${status.sync.files.details.total}`);
    }
    if (status.sync.files.errors.length > 0) {
      console.log(`  Errors: ${status.sync.files.errors.join(', ')}`);
    }
    
    console.log(`Services: ${status.sync.services.synced ? '✅ SYNCED' : '❌ NOT SYNCED'}`);
    if (status.sync.services.details) {
      console.log(`  Services: ${status.sync.services.details.loaded}/${status.sync.services.details.total}`);
    }
    if (status.sync.services.errors.length > 0) {
      console.log(`  Errors: ${status.sync.services.errors.join(', ')}`);
    }
    console.log('');
    
    console.log('🚀 PIPELINE STATE');
    console.log('-'.repeat(70));
    console.log(`Active Pipelines: ${status.pipeline.activePipelines}`);
    console.log(`Completed Today: ${status.pipeline.completedToday}`);
    console.log(`Failed Today: ${status.pipeline.failedToday}`);
    if (status.pipeline.currentStage) {
      console.log(`Current Stage: ${status.pipeline.currentStage.filename} (${status.pipeline.currentStage.status})`);
      console.log(`Progress: ${status.pipeline.currentStage.progress}%`);
    } else {
      console.log('Current Stage: None (No active pipelines)');
    }
    console.log('');
    
    if (metrics) {
      console.log('📈 METRICS (Last 24 Hours)');
      console.log('-'.repeat(70));
      console.log(`Pipeline: ${metrics.pipeline.total} total, ${metrics.pipeline.completed} completed, ${metrics.pipeline.failed} failed`);
      console.log(`Leads: ${metrics.leads.total} total, ${metrics.leads.classified} classified, ${metrics.leads.hubspotSynced} HubSpot synced`);
      console.log(`Emails: ${metrics.emails.total} total, ${metrics.emails.sent} sent, ${metrics.emails.opened} opened, ${metrics.emails.bounced} bounced`);
      console.log(`Sequences: ${metrics.sequences.total} total, ${metrics.sequences.active} active, ${metrics.sequences.paused} paused`);
      console.log('');
    }
    
    console.log('✅ Status check complete!');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showTracker();

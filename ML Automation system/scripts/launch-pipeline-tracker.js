#!/usr/bin/env node

/**
 * Pipeline Tracker Launcher
 * Launches the pipeline tracker as a standalone service or checks status
 */

const http = require('http');
const readline = require('readline');

const API_BASE = process.env.API_BASE || 'http://localhost:7101';
const TRACKER_ENDPOINT = `${API_BASE}/api/pipeline-tracker`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Display status
 */
async function displayStatus() {
  try {
    const { status, data } = await makeRequest('GET', `${TRACKER_ENDPOINT}/status`);

    if (status !== 200) {
      console.error(`❌ Error: ${data.error || 'Unknown error'}`);
      return;
    }

    console.log('\n📊 PIPELINE TRACKER STATUS');
    console.log('='.repeat(70));
    console.log(`Tracker Running: ${data.tracker.running ? '✅ YES' : '❌ NO'}`);
    console.log(`Last Sync Check: ${data.tracker.lastSyncCheck || 'Never'}`);
    console.log('');

    // Sync Status
    console.log('🔄 SYNC STATUS');
    console.log('-'.repeat(70));
    console.log(`Database: ${data.sync.database.synced ? '✅ SYNCED' : '❌ NOT SYNCED'}`);
    if (data.sync.database.errors.length > 0) {
      console.log(`  Errors: ${data.sync.database.errors.join(', ')}`);
    }
    console.log(`Files: ${data.sync.files.synced ? '✅ SYNCED' : '❌ NOT SYNCED'}`);
    if (data.sync.files.errors.length > 0) {
      console.log(`  Errors: ${data.sync.files.errors.join(', ')}`);
    }
    console.log(`Services: ${data.sync.services.synced ? '✅ SYNCED' : '❌ NOT SYNCED'}`);
    if (data.sync.services.errors.length > 0) {
      console.log(`  Errors: ${data.sync.services.errors.join(', ')}`);
    }
    console.log('');

    // Pipeline State
    console.log('🚀 PIPELINE STATE');
    console.log('-'.repeat(70));
    console.log(`Active Pipelines: ${data.pipeline.activePipelines}`);
    console.log(`Completed Today: ${data.pipeline.completedToday}`);
    console.log(`Failed Today: ${data.pipeline.failedToday}`);
    if (data.pipeline.currentStage) {
      console.log(`Current Stage: ${data.pipeline.currentStage.filename} (${data.pipeline.currentStage.status})`);
      console.log(`Progress: ${data.pipeline.currentStage.progress}%`);
    } else {
      console.log('Current Stage: None');
    }
    console.log('');

  } catch (error) {
    console.error(`❌ Error getting status: ${error.message}`);
  }
}

/**
 * Display metrics
 */
async function displayMetrics(timeframe = '24 hours') {
  try {
    const { status, data } = await makeRequest('GET', `${TRACKER_ENDPOINT}/metrics?timeframe=${encodeURIComponent(timeframe)}`);

    if (status !== 200) {
      console.error(`❌ Error: ${data.error || 'Unknown error'}`);
      return;
    }

    console.log('\n📈 PIPELINE METRICS');
    console.log('='.repeat(70));
    console.log(`Timeframe: ${data.timeframe}`);
    console.log('');

    console.log('📁 Pipeline');
    console.log(`  Total: ${data.pipeline.total}`);
    console.log(`  Completed: ${data.pipeline.completed}`);
    console.log(`  Failed: ${data.pipeline.failed}`);
    console.log(`  Processing: ${data.pipeline.processing}`);
    console.log('');

    console.log('👥 Leads');
    console.log(`  Total: ${data.leads.total}`);
    console.log(`  Classified: ${data.leads.classified}`);
    console.log(`  HubSpot Synced: ${data.leads.hubspotSynced}`);
    console.log('');

    console.log('📧 Emails');
    console.log(`  Total: ${data.emails.total}`);
    console.log(`  Sent: ${data.emails.sent}`);
    console.log(`  Opened: ${data.emails.opened}`);
    console.log(`  Bounced: ${data.emails.bounced}`);
    console.log('');

    console.log('🔄 Sequences');
    console.log(`  Total: ${data.sequences.total}`);
    console.log(`  Active: ${data.sequences.active}`);
    console.log(`  Paused: ${data.sequences.paused}`);
    console.log(`  Completed: ${data.sequences.completed}`);
    console.log('');

  } catch (error) {
    console.error(`❌ Error getting metrics: ${error.message}`);
  }
}

/**
 * Start tracker
 */
async function startTracker(interval = 5000) {
  try {
    const { status, data } = await makeRequest('POST', `${TRACKER_ENDPOINT}/start`, { interval });

    if (status === 200) {
      console.log(`✅ ${data.message}`);
      console.log(`   Interval: ${data.interval}ms`);
    } else {
      console.error(`❌ Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`❌ Error starting tracker: ${error.message}`);
  }
}

/**
 * Stop tracker
 */
async function stopTracker() {
  try {
    const { status, data } = await makeRequest('POST', `${TRACKER_ENDPOINT}/stop`);

    if (status === 200) {
      console.log(`✅ ${data.message}`);
    } else {
      console.error(`❌ Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`❌ Error stopping tracker: ${error.message}`);
  }
}

/**
 * Force sync check
 */
async function forceSyncCheck() {
  try {
    console.log('🔄 Performing full sync check...');
    const { status, data } = await makeRequest('POST', `${TRACKER_ENDPOINT}/sync-check`);

    if (status === 200) {
      console.log(`✅ ${data.message}`);
      console.log('\nSync Status:');
      console.log(`  Database: ${data.status.database.synced ? '✅' : '❌'}`);
      console.log(`  Files: ${data.status.files.synced ? '✅' : '❌'}`);
      console.log(`  Services: ${data.status.services.synced ? '✅' : '❌'}`);
    } else {
      console.error(`❌ Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`❌ Error performing sync check: ${error.message}`);
  }
}

/**
 * Main menu
 */
async function showMenu() {
  console.log('\n📊 PIPELINE TRACKER');
  console.log('='.repeat(70));
  console.log('1. Show Status');
  console.log('2. Show Metrics');
  console.log('3. Start Tracker');
  console.log('4. Stop Tracker');
  console.log('5. Force Sync Check');
  console.log('6. Monitor (Live Updates)');
  console.log('0. Exit');
  console.log('');

  rl.question('Select option: ', async (answer) => {
    switch (answer) {
      case '1':
        await displayStatus();
        showMenu();
        break;
      case '2':
        await displayMetrics();
        showMenu();
        break;
      case '3':
        await startTracker();
        showMenu();
        break;
      case '4':
        await stopTracker();
        showMenu();
        break;
      case '5':
        await forceSyncCheck();
        showMenu();
        break;
      case '6':
        await monitorLive();
        break;
      case '0':
        console.log('\n👋 Goodbye!');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('❌ Invalid option');
        showMenu();
    }
  });
}

/**
 * Live monitoring
 */
async function monitorLive() {
  console.log('\n🔍 LIVE MONITORING MODE');
  console.log('='.repeat(70));
  console.log('Press Ctrl+C to exit\n');

  const interval = setInterval(async () => {
    try {
      const { status, data } = await makeRequest('GET', `${TRACKER_ENDPOINT}/status`);
      if (status === 200) {
        process.stdout.write('\r');
        process.stdout.write(`⏱️  Active: ${data.pipeline.activePipelines} | `);
        process.stdout.write(`Completed: ${data.pipeline.completedToday} | `);
        process.stdout.write(`Failed: ${data.pipeline.failedToday} | `);
        process.stdout.write(`DB: ${data.sync.database.synced ? '✅' : '❌'} | `);
        process.stdout.write(`Files: ${data.sync.files.synced ? '✅' : '❌'} | `);
        process.stdout.write(`Services: ${data.sync.services.synced ? '✅' : '❌'}     `);
      }
    } catch (error) {
      // Silent error handling for live mode
    }
  }, 2000);

  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n\n✅ Monitoring stopped');
    showMenu();
  });
}

// Main execution
const command = process.argv[2];
const arg = process.argv[3];

if (command === 'status') {
  displayStatus().then(() => process.exit(0));
} else if (command === 'metrics') {
  displayMetrics(arg || '24 hours').then(() => process.exit(0));
} else if (command === 'start') {
  startTracker(parseInt(arg) || 5000).then(() => process.exit(0));
} else if (command === 'stop') {
  stopTracker().then(() => process.exit(0));
} else if (command === 'sync') {
  forceSyncCheck().then(() => process.exit(0));
} else if (command === 'monitor') {
  monitorLive();
} else {
  // Interactive mode
  showMenu();
}

#!/usr/bin/env node

/**
 * System Watcher Script
 * Continuously monitors and logs the entire system
 * Runs as a background process to track all pipeline flows
 */

const systemWatcher = require('../src/services/systemWatcher');
const logger = require('../src/utils/logger');
const googleDrive = require('../src/services/googleDrive');
const orchestrator = require('../src/orchestrator');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bright: '\x1b[1m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n🛑 Stopping system watcher...', 'yellow');
  systemWatcher.stopWatching();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n🛑 Stopping system watcher...', 'yellow');
  systemWatcher.stopWatching();
  process.exit(0);
});

async function startWatching() {
  log('\n═══════════════════════════════════════════════════════════════════════════════', 'cyan');
  log('🔍 HINGECRAFT ML AUTOMATION - SYSTEM WATCHER', 'bright');
  log('═══════════════════════════════════════════════════════════════════════════════\n', 'cyan');

  // Start the watcher in standby mode
  await systemWatcher.startWatching();

  const status = systemWatcher.getStatus();
  
  log('✅ System watcher in STANDBY MODE', 'green');
  log('⏸️  Status: WAITING ON INPUT STAGE', 'yellow');
  log('\n📊 All components ready and waiting:', 'blue');
  log('   - Google Drive (standby - waiting for file)', 'cyan');
  log('   - File Processor (standby - ready)', 'cyan');
  log('   - Lead Processor (standby - ready)', 'cyan');
  log('   - Anymail (standby - ready)', 'cyan');
  log('   - Database (standby - ready)', 'cyan');
  log('   - HubSpot (standby - ready)', 'cyan');
  log('   - Sequence Engine (standby - ready)', 'cyan');
  log('   - Email Wave Sender (standby - ready)', 'cyan');
  log('\n📝 All pipeline events will be logged to:', 'blue');
  log(`   ${require('path').join(__dirname, '../logs/pipeline.log')}`, 'cyan');
  log('\n⏳ ═══════════════════════════════════════════════════════════════', 'yellow');
  log('⏳ WAITING FOR FILE IN GOOGLE DRIVE...', 'bright');
  log('⏳ Drop a file in Google Drive folder to activate tracking', 'yellow');
  log('⏳ ═══════════════════════════════════════════════════════════════\n', 'yellow');

  // Monitor system status every 30 seconds
  const statusInterval = setInterval(() => {
    const status = systemWatcher.getStatus();
    const activePipelines = systemWatcher.getAllActivePipelines();
    
    if (status.waitingForFile && status.mode === 'standby') {
      log(`\n⏳ Status: STANDBY - Waiting for file input...`, 'yellow');
    } else if (status.mode === 'active') {
      log(`\n🚀 Status: ACTIVE - Tracking pipeline flow`, 'green');
      if (activePipelines.length > 0) {
        log(`📊 Active Pipelines: ${activePipelines.length}`, 'magenta');
        activePipelines.forEach(pipeline => {
          const duration = pipeline.endTime 
            ? Math.round((pipeline.endTime - pipeline.startTime) / 1000)
            : Math.round((new Date() - pipeline.startTime) / 1000);
          log(`   ${pipeline.fileName} - ${pipeline.status} (${duration}s)`, 'cyan');
        });
      }
    }
  }, 30000);

  // Watch for file changes (if webhook is set up)
  // This would typically be handled by the webhook endpoint
  // But we can also poll the folder periodically
  
  log('✅ Watcher is active and monitoring...\n', 'green');
  log('Press Ctrl+C to stop\n', 'yellow');

  // Keep process alive
  return new Promise(() => {
    // Process stays alive to monitor
  });
}

// Start watching
startWatching().catch(error => {
  log(`\n❌ Error starting watcher: ${error.message}`, 'red');
  process.exit(1);
});





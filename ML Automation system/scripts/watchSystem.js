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

  // Start the watcher
  await systemWatcher.startWatching();

  log('✅ System watcher started', 'green');
  log('📊 Monitoring all components:', 'blue');
  log('   - Google Drive (file detection)', 'cyan');
  log('   - File Processor (all formats)', 'cyan');
  log('   - Lead Processor (normalization)', 'cyan');
  log('   - Anymail (email collection)', 'cyan');
  log('   - Database (integration)', 'cyan');
  log('   - HubSpot (CRM sync)', 'cyan');
  log('   - Sequence Engine (automation)', 'cyan');
  log('   - Email Wave Sender (delivery)', 'cyan');
  log('\n📝 All pipeline events are being logged to:', 'blue');
  log(`   ${require('path').join(__dirname, '../logs/pipeline.log')}`, 'cyan');
  log('\n⏳ Waiting for file trigger...', 'yellow');
  log('   Drop a file in Google Drive folder to start pipeline\n', 'yellow');

  // Monitor system status every 30 seconds
  const statusInterval = setInterval(() => {
    const componentStatus = systemWatcher.getComponentStatus();
    const activePipelines = systemWatcher.getAllActivePipelines();
    
    if (activePipelines.length > 0) {
      log(`\n📊 Active Pipelines: ${activePipelines.length}`, 'magenta');
      activePipelines.forEach(pipeline => {
        const duration = pipeline.endTime 
          ? Math.round((pipeline.endTime - pipeline.startTime) / 1000)
          : Math.round((new Date() - pipeline.startTime) / 1000);
        log(`   ${pipeline.fileName} - ${pipeline.status} (${duration}s)`, 'cyan');
      });
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

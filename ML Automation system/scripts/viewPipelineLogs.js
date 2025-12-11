#!/usr/bin/env node

/**
 * Pipeline Log Viewer
 * View real-time pipeline logs and status
 */

const systemWatcher = require('../src/services/systemWatcher');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bright: '\x1b[1m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString();
}

function formatDuration(ms) {
  if (!ms) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function viewLogs() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'status') {
    // Show system status
    log('\n═══════════════════════════════════════════════════════════════════════════════', 'cyan');
    log('📊 PIPELINE SYSTEM STATUS', 'bright');
    log('═══════════════════════════════════════════════════════════════════════════════\n', 'cyan');

    const componentStatus = systemWatcher.getComponentStatus();
    const activePipelines = systemWatcher.getAllActivePipelines();

    log(`🔍 Watcher Status: ${systemWatcher.isWatching ? '✅ ACTIVE' : '❌ INACTIVE'}`, systemWatcher.isWatching ? 'green' : 'red');
    log(`📋 Active Pipelines: ${activePipelines.length}\n`, 'blue');

    if (activePipelines.length > 0) {
      activePipelines.forEach((pipeline, index) => {
        log(`\n${index + 1}. ${pipeline.fileName}`, 'bright');
        log(`   Status: ${pipeline.status}`, pipeline.status === 'completed' ? 'green' : 'yellow');
        log(`   Started: ${formatTime(pipeline.startTime)}`, 'gray');
        if (pipeline.endTime) {
          log(`   Duration: ${formatDuration(pipeline.totalDuration)}`, 'gray');
        } else {
          const running = Date.now() - pipeline.startTime;
          log(`   Running: ${formatDuration(running)}`, 'gray');
        }
        
        // Show stage status
        log(`   Stages:`, 'cyan');
        Object.entries(pipeline.stages).forEach(([stage, data]) => {
          const statusIcon = data.status === 'completed' ? '✅' : 
                           data.status === 'failed' ? '❌' : 
                           data.status === 'started' ? '⏳' : '⏸️';
          log(`     ${statusIcon} ${stage}: ${data.status}`, 
              data.status === 'completed' ? 'green' : 
              data.status === 'failed' ? 'red' : 'yellow');
          if (data.duration) {
            log(`        Duration: ${formatDuration(data.duration)}`, 'gray');
          }
        });
      });
    }

    log('\n📊 Component Status:', 'blue');
    Object.entries(componentStatus).forEach(([component, status]) => {
      const lastCheck = status.lastCheck ? formatTime(status.lastCheck) : 'Never';
      log(`   ${component}: ${status.status} (Last: ${lastCheck})`, 'cyan');
    });

  } else if (command === 'logs') {
    // Show recent logs
    const limit = parseInt(args[1]) || 50;
    const component = args[2];
    
    log('\n═══════════════════════════════════════════════════════════════════════════════', 'cyan');
    log('📝 RECENT PIPELINE LOGS', 'bright');
    log('═══════════════════════════════════════════════════════════════════════════════\n', 'cyan');

    let logs;
    if (component) {
      logs = systemWatcher.getLogsByComponent(component, limit);
      log(`Showing logs for component: ${component}\n`, 'blue');
    } else {
      logs = systemWatcher.getRecentLogs(limit);
      log(`Showing last ${limit} logs\n`, 'blue');
    }

    if (logs.length === 0) {
      log('No logs found', 'yellow');
      return;
    }

    logs.forEach(logEntry => {
      const time = formatTime(logEntry.timestamp);
      const componentColor = logEntry.component === 'PIPELINE' ? 'magenta' : 'cyan';
      log(`[${time}] [${logEntry.component}] ${logEntry.event}`, componentColor);
      if (logEntry.data && Object.keys(logEntry.data).length > 0) {
        Object.entries(logEntry.data).forEach(([key, value]) => {
          if (key !== 'timestamp' && key !== 'pipelineId') {
            log(`  ${key}: ${value}`, 'gray');
          }
        });
      }
    });

  } else if (command === 'pipeline') {
    // Show specific pipeline
    const pipelineId = args[1];
    if (!pipelineId) {
      log('Usage: node viewPipelineLogs.js pipeline <pipeline-id>', 'red');
      return;
    }

    const report = systemWatcher.generatePipelineReport(pipelineId);
    if (report.error) {
      log(`❌ ${report.error}`, 'red');
      return;
    }

    log('\n═══════════════════════════════════════════════════════════════════════════════', 'cyan');
    log('📊 PIPELINE REPORT', 'bright');
    log('═══════════════════════════════════════════════════════════════════════════════\n', 'cyan');

    log(`File: ${report.pipeline.fileName}`, 'bright');
    log(`Status: ${report.pipeline.status}`, report.pipeline.status === 'completed' ? 'green' : 'yellow');
    log(`Started: ${formatTime(report.pipeline.startTime)}`, 'gray');
    if (report.pipeline.endTime) {
      log(`Ended: ${formatTime(report.pipeline.endTime)}`, 'gray');
      log(`Duration: ${formatDuration(report.pipeline.totalDuration)}`, 'gray');
    }

    log('\n📋 Stages:', 'blue');
    Object.entries(report.stages).forEach(([stage, data]) => {
      const statusIcon = data.status === 'completed' ? '✅' : 
                       data.status === 'failed' ? '❌' : 
                       data.status === 'started' ? '⏳' : '⏸️';
      log(`  ${statusIcon} ${stage}: ${data.status}`, 
          data.status === 'completed' ? 'green' : 
          data.status === 'failed' ? 'red' : 'yellow');
      if (data.duration) {
        log(`     Duration: ${formatDuration(data.duration)}`, 'gray');
      }
      if (data.data && Object.keys(data.data).length > 0) {
        Object.entries(data.data).forEach(([key, value]) => {
          log(`     ${key}: ${value}`, 'gray');
        });
      }
    });

    if (report.summary && Object.keys(report.summary).length > 0) {
      log('\n📊 Summary:', 'blue');
      Object.entries(report.summary).forEach(([key, value]) => {
        log(`  ${key}: ${value}`, 'cyan');
      });
    }

  } else if (command === 'file') {
    // View log file directly
    const logFile = path.join(__dirname, '../logs/pipeline.log');
    if (!fs.existsSync(logFile)) {
      log(`Log file not found: ${logFile}`, 'red');
      return;
    }

    const lines = parseInt(args[1]) || 50;
    const content = fs.readFileSync(logFile, 'utf8');
    const logLines = content.trim().split('\n').slice(-lines);

    log('\n═══════════════════════════════════════════════════════════════════════════════', 'cyan');
    log('📄 PIPELINE LOG FILE (Last ' + lines + ' lines)', 'bright');
    log('═══════════════════════════════════════════════════════════════════════════════\n', 'cyan');

    logLines.forEach(line => {
      try {
        const logEntry = JSON.parse(line);
        const time = formatTime(logEntry.timestamp);
        log(`[${time}] [${logEntry.component}] ${logEntry.event}`, 'cyan');
      } catch (e) {
        log(line, 'gray');
      }
    });

  } else {
    // Show help
    log('\n═══════════════════════════════════════════════════════════════════════════════', 'cyan');
    log('📝 PIPELINE LOG VIEWER', 'bright');
    log('═══════════════════════════════════════════════════════════════════════════════\n', 'cyan');
    log('Usage:', 'blue');
    log('  node viewPipelineLogs.js status                    - Show system status', 'cyan');
    log('  node viewPipelineLogs.js logs [limit] [component]   - Show recent logs', 'cyan');
    log('  node viewPipelineLogs.js pipeline <id>              - Show pipeline report', 'cyan');
    log('  node viewPipelineLogs.js file [lines]              - View log file', 'cyan');
    log('\nExamples:', 'blue');
    log('  node viewPipelineLogs.js status', 'gray');
    log('  node viewPipelineLogs.js logs 100', 'gray');
    log('  node viewPipelineLogs.js logs 50 PIPELINE', 'gray');
    log('  node viewPipelineLogs.js pipeline abc-123-def', 'gray');
    log('  node viewPipelineLogs.js file 200', 'gray');
    log('\n');
  }
}

viewLogs().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});

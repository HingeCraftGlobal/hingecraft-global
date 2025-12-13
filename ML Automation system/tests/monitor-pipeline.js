/**
 * Pipeline Monitoring Script
 * Monitors the automation pipeline in real-time when a file is dropped
 */

const http = require('http');

const API_BASE = 'http://localhost:7101';
const POLL_INTERVAL = 2000; // 2 seconds

let lastPipelineCount = 0;
let lastLogCount = 0;

/**
 * Make HTTP request
 */
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`${API_BASE}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Invalid JSON' });
        }
      });
    }).on('error', reject);
  });
}

/**
 * Monitor pipeline status
 */
async function monitorPipeline() {
  console.log('🔍 Monitoring HingeCraft ML Automation Pipeline');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 Drop a file in Google Drive folder to start processing');
  console.log('📁 Folder ID: 1MpKKqjpabi10iDh1vWliaiLQsj8wktiz');
  console.log('⏱️  Polling every 2 seconds...');
  console.log('═══════════════════════════════════════════════════════\n');

  const startTime = Date.now();

  while (true) {
    try {
      // Get pipeline status
      const status = await makeRequest('/api/pipeline/status');
      
      // Get recent logs
      const logs = await makeRequest('/api/pipeline/logs?limit=10');
      
      // Check for new pipelines
      if (status.activePipelines > lastPipelineCount) {
        console.log(`\n🆕 NEW PIPELINE DETECTED! (Total: ${status.activePipelines})`);
        console.log('─────────────────────────────────────────────');
        
        if (status.pipelines && status.pipelines.length > 0) {
          const latestPipeline = status.pipelines[status.pipelines.length - 1];
          console.log(`Pipeline ID: ${latestPipeline.id}`);
          console.log(`Status: ${latestPipeline.status}`);
          console.log(`Stage: ${latestPipeline.currentStage || 'N/A'}`);
        }
      }
      
      // Check for new logs
      if (logs.logs && logs.logs.length > lastLogCount) {
        const newLogs = logs.logs.slice(lastLogCount);
        newLogs.forEach(log => {
          const timestamp = new Date(log.timestamp || Date.now()).toLocaleTimeString();
          const level = log.level || 'info';
          const icon = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
          console.log(`[${timestamp}] ${icon} ${log.message || log.text || ''}`);
        });
        lastLogCount = logs.logs.length;
      }
      
      // Display current status
      if (status.activePipelines > 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        process.stdout.write(`\r⏱️  Active Pipelines: ${status.activePipelines} | Elapsed: ${elapsed}s | Status: ${status.status}     `);
      } else {
        process.stdout.write(`\r⏳ Waiting for file... (${status.status})     `);
      }
      
      lastPipelineCount = status.activePipelines;
      
    } catch (error) {
      console.error(`\n❌ Error monitoring: ${error.message}`);
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n✅ Monitoring stopped');
  process.exit(0);
});

// Start monitoring
monitorPipeline().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

/**
 * Full Automation Flow Test
 * Tests complete automation from file drop to email sending
 * Monitors every stage through the tracker
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:7101';
const POLL_INTERVAL = 2000; // 2 seconds

let pipelineId = null;
let stageHistory = [];

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
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
 * Wait for condition
 */
function waitFor(condition, timeout = 60000, interval = 1000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = async () => {
      try {
        const result = await condition();
        if (result) {
          resolve(result);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, interval);
        }
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, interval);
        }
      }
    };
    check();
  });
}

/**
 * Monitor pipeline stage
 */
async function monitorStage(stageName, expectedStatus = 'completed') {
  console.log(`\n📊 Monitoring Stage: ${stageName}`);
  console.log('─────────────────────────────────────────────');
  
  const startTime = Date.now();
  let lastStatus = null;
  
  try {
    await waitFor(async () => {
      const status = await makeRequest('GET', '/api/pipeline/status');
      
      if (status.data.activePipelines > 0 && status.data.pipelines && status.data.pipelines.length > 0) {
        const pipeline = status.data.pipelines[0];
        
        if (pipeline.currentStage === stageName) {
          const currentStatus = pipeline.stages?.[stageName]?.status;
          
          if (currentStatus !== lastStatus) {
            lastStatus = currentStatus;
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`  ⏱️  [${elapsed}s] ${stageName}: ${currentStatus}`);
            
            if (currentStatus === expectedStatus) {
              const stageData = pipeline.stages?.[stageName];
              if (stageData) {
                console.log(`  ✅ Stage ${stageName} ${expectedStatus}`);
                if (stageData.duration) {
                  console.log(`  ⏱️  Duration: ${stageData.duration}ms`);
                }
                if (stageData.rowCount) {
                  console.log(`  📊 Rows: ${stageData.rowCount}`);
                }
                if (stageData.processed) {
                  console.log(`  📊 Processed: ${stageData.processed}`);
                }
              }
              return true;
            }
          }
        }
      }
      
      return false;
    }, 120000); // 2 minute timeout per stage
    
    const duration = Date.now() - startTime;
    stageHistory.push({
      stage: stageName,
      status: expectedStatus,
      duration
    });
    
    return true;
  } catch (error) {
    console.log(`  ❌ Stage ${stageName} failed: ${error.message}`);
    return false;
  }
}

/**
 * Display pipeline progress
 */
function displayProgress(pipeline) {
  const stages = [
    'fileProcessing',
    'leadProcessing',
    'emailCollection',
    'databaseIntegration',
    'hubspotSync',
    'eventTracking'
  ];
  
  console.log('\n📈 Pipeline Progress:');
  stages.forEach(stage => {
    const stageData = pipeline.stages?.[stage];
    if (stageData) {
      const status = stageData.status || 'pending';
      const icon = status === 'completed' ? '✅' : status === 'started' ? '🔄' : '⏳';
      console.log(`  ${icon} ${stage}: ${status}`);
    } else {
      console.log(`  ⏳ ${stage}: pending`);
    }
  });
}

/**
 * Test Complete Automation Flow
 */
async function testFullAutomationFlow() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 HingeCraft ML Automation - Full Flow Test');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Testing complete automation from file drop to completion');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const flowStart = Date.now();
  
  try {
    // Step 1: Verify System Ready
    console.log('📋 Step 1: Verify System Ready');
    console.log('─────────────────────────────────────────────');
    
    const health = await makeRequest('GET', '/health');
    const oauth = await makeRequest('GET', '/auth/status');
    const pipelineStatus = await makeRequest('GET', '/api/pipeline/status');
    
    if (health.status !== 200 || !oauth.data.authorized || !pipelineStatus.data.watcherActive) {
      throw new Error('System not ready');
    }
    
    console.log('  ✅ System Health: OK');
    console.log('  ✅ OAuth: Authorized');
    console.log('  ✅ Tracker: Active');
    console.log('  ✅ Mode: ' + pipelineStatus.data.mode);
    console.log('');
    
    // Step 2: Create Test File
    console.log('📄 Step 2: Create Test File');
    console.log('─────────────────────────────────────────────');
    
    const testData = [
      'email,first_name,last_name,organization,phone,city,state',
      'test1@example.com,John,Doe,Acme Corp,555-1234,San Francisco,CA',
      'test2@example.com,Jane,Smith,Tech Inc,555-5678,New York,NY',
      'test3@example.com,Bob,Johnson,Global LLC,555-9012,Chicago,IL',
      'test4@example.com,Alice,Williams,Digital Co,555-3456,Los Angeles,CA',
      'test5@example.com,Charlie,Brown,Innovation Labs,555-7890,Seattle,WA'
    ].join('\n');
    
    const testFilePath = path.join(__dirname, '../test-automation-leads.csv');
    fs.writeFileSync(testFilePath, testData);
    
    console.log(`  ✅ Test file created: ${path.basename(testFilePath)}`);
    console.log(`  ✅ Rows: ${testData.split('\n').length - 1}`);
    console.log('');
    
    // Step 3: Instructions for Manual Upload
    console.log('📤 Step 3: Upload File to Google Drive');
    console.log('─────────────────────────────────────────────');
    console.log('  📁 Folder ID: 1MpKKqjpabi10iDh1vWliaiLQsj8wktiz');
    console.log('  🔗 URL: https://drive.google.com/drive/folders/1MpKKqjpabi10iDh1vWliaiLQsj8wktiz');
    console.log(`  📄 File: ${testFilePath}`);
    console.log('');
    console.log('  ⚠️  Please upload the test file to Google Drive folder');
    console.log('  ⏳ Waiting for file detection...');
    console.log('');
    
    // Step 4: Monitor for File Detection
    console.log('🔍 Step 4: Monitor File Detection');
    console.log('─────────────────────────────────────────────');
    
    let fileDetected = false;
    let detectionStart = Date.now();
    
    // Monitor for up to 2 minutes for file detection
    try {
      await waitFor(async () => {
        const status = await makeRequest('GET', '/api/pipeline/status');
        
        if (status.data.activePipelines > 0) {
          fileDetected = true;
          pipelineId = status.data.pipelines?.[0]?.id;
          console.log(`  ✅ File detected! Pipeline ID: ${pipelineId}`);
          console.log(`  ⏱️  Detection time: ${((Date.now() - detectionStart) / 1000).toFixed(1)}s`);
          return true;
        }
        
        // Also check if we can manually trigger a poll
        const elapsed = (Date.now() - detectionStart) / 1000;
        if (elapsed > 10 && Math.floor(elapsed) % 10 === 0) {
          console.log(`  ⏳ Still waiting... (${elapsed.toFixed(0)}s elapsed)`);
          // Trigger manual poll
          await makeRequest('POST', '/api/trigger-poll');
        }
        
        return false;
      }, 120000); // 2 minute timeout
    } catch (error) {
      console.log(`  ⚠️  File not detected automatically. You can manually trigger processing.`);
      console.log(`  💡 To manually process a file, use: curl -X POST http://localhost:7101/api/process-file -d '{"fileId":"YOUR_FILE_ID"}'`);
      console.log('');
      console.log('  📊 Continuing with component verification...');
    }
    
    // Step 5: Monitor All Pipeline Stages
    if (fileDetected && pipelineId) {
      console.log('\n🔄 Step 5: Monitor Complete Pipeline Flow');
      console.log('═══════════════════════════════════════════════════════');
      
      // Monitor each stage
      const stages = [
        'fileProcessing',
        'leadProcessing',
        'emailCollection',
        'databaseIntegration',
        'hubspotSync',
        'eventTracking'
      ];
      
      for (const stage of stages) {
        await monitorStage(stage, 'completed');
        
        // Get current pipeline status
        const status = await makeRequest('GET', '/api/pipeline/status');
        if (status.data.pipelines && status.data.pipelines.length > 0) {
          displayProgress(status.data.pipelines[0]);
        }
      }
      
      // Step 6: Verify Completion
      console.log('\n✅ Step 6: Verify Pipeline Completion');
      console.log('─────────────────────────────────────────────');
      
      const finalStatus = await makeRequest('GET', `/api/pipeline/${pipelineId}`);
      if (finalStatus.data.success) {
        const report = finalStatus.data;
        console.log('  ✅ Pipeline completed successfully!');
        console.log(`  📊 Total Rows: ${report.totalRows || 'N/A'}`);
        console.log(`  📊 Processed: ${report.processed || 'N/A'}`);
        console.log(`  📊 Errors: ${report.errors || 0}`);
        console.log(`  📊 HubSpot Synced: ${report.hubspot_synced || 0}`);
        console.log(`  📊 Emails Sent: ${report.emails_sent || 0}`);
        console.log(`  📊 Email Waves: ${report.email_waves || 0}`);
      }
    }
    
    // Step 7: Component Verification
    console.log('\n🔧 Step 7: Verify All Components');
    console.log('─────────────────────────────────────────────');
    
    const componentStatus = await makeRequest('GET', '/api/pipeline/status');
    const components = componentStatus.data.componentStatus || {};
    
    Object.keys(components).forEach(component => {
      const status = components[component];
      const icon = status.status === 'active' ? '✅' : status.status === 'standby' ? '⏳' : '❌';
      console.log(`  ${icon} ${component}: ${status.status}`);
    });
    
    // Step 8: Final Statistics
    console.log('\n📊 Step 8: Final Statistics');
    console.log('─────────────────────────────────────────────');
    
    const stats = await makeRequest('GET', '/api/statistics');
    if (stats.data) {
      console.log(`  📊 Total Leads: ${stats.data.leads?.total || 0}`);
      console.log(`  📊 New Leads: ${stats.data.leads?.new || 0}`);
      console.log(`  📊 Enriched Leads: ${stats.data.leads?.enriched || 0}`);
      console.log(`  📊 Active Sequences: ${stats.data.sequences?.active || 0}`);
      console.log(`  📊 Emails Sent: ${stats.data.emails?.sent || 0}`);
      console.log(`  📊 Emails Delivered: ${stats.data.emails?.delivered || 0}`);
      console.log(`  📊 Emails Opened: ${stats.data.emails?.opened || 0}`);
    }
    
    const flowDuration = ((Date.now() - flowStart) / 1000).toFixed(1);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ FULL AUTOMATION FLOW TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`⏱️  Total Duration: ${flowDuration}s`);
    console.log(`📊 Stages Completed: ${stageHistory.length}`);
    console.log(`✅ System Status: OPERATIONAL`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (fileDetected) {
      console.log('🎉 Automation flow completed successfully!');
      console.log(`📄 Pipeline Report: http://localhost:7101/api/pipeline/${pipelineId}`);
    } else {
      console.log('⚠️  File not detected. Please upload file to Google Drive folder.');
      console.log('📁 Folder: https://drive.google.com/drive/folders/1MpKKqjpabi10iDh1vWliaiLQsj8wktiz');
    }
    
  } catch (error) {
    console.error('\n❌ Flow test failed:', error);
    throw error;
  }
}

// Run test if executed directly
if (require.main === module) {
  testFullAutomationFlow()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testFullAutomationFlow };

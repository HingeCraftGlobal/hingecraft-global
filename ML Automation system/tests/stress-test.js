/**
 * HingeCraft ML Automation System - Comprehensive Stress Test
 * Tests system with 100,000 resources to identify bottlenecks, memory leaks, and failures
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const db = require('../src/utils/database');
const logger = require('../src/utils/logger');
const orchestrator = require('../src/orchestrator');
const healthCheck = require('../src/monitoring/healthCheck');
const config = require('../config/api_keys');

// Test Configuration
const TEST_CONFIG = {
  totalResources: 100000,
  batchSize: 1000,
  concurrentBatches: 10,
  maxRetries: 3,
  timeout: 300000, // 5 minutes per batch
  enableApiTests: true,
  enableDatabaseTests: true,
  enableMemoryTests: true,
  enableRateLimitTests: true
};

// Test Results Storage
const testResults = {
  startTime: null,
  endTime: null,
  duration: 0,
  totalResources: 0,
  processed: 0,
  failed: 0,
  errors: [],
  performance: {
    database: [],
    api: [],
    memory: [],
    rateLimits: []
  },
  bottlenecks: [],
  memoryLeaks: [],
  failures: []
};

/**
 * Generate test lead data
 */
function generateTestLead(index) {
  const domains = ['example.com', 'test.com', 'demo.com', 'sample.org', 'company.net'];
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  const companies = ['Acme Corp', 'Tech Solutions', 'Global Inc', 'Digital Services', 'Innovation Labs'];
  
  const domain = domains[index % domains.length];
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[index % lastNames.length];
  const company = companies[index % companies.length];
  const email = `test${index}@${domain}`;
  
  return {
    email: email,
    first_name: firstName,
    last_name: lastName,
    organization: company,
    title: 'Manager',
    phone: `555-${String(index).padStart(4, '0')}`,
    website: `https://www.${domain}`,
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    source: 'stress_test',
    source_file_id: 'stress-test-file',
    source_row_number: index + 1
  };
}

/**
 * Test Database Performance
 */
async function testDatabasePerformance(batchSize) {
  const testName = 'Database Bulk Insert';
  const startTime = performance.now();
  
  try {
    const leads = Array.from({ length: batchSize }, (_, i) => generateTestLead(i));
    
    // Test bulk insert
    const insertStart = performance.now();
      // Use simpler approach for bulk insert to avoid parameter limit issues
      // Insert in smaller chunks if batch is too large
      const chunkSize = 100;
      for (let i = 0; i < leads.length; i += chunkSize) {
        const chunk = leads.slice(i, i + chunkSize);
        const values = chunk.map((_, idx) => {
          const paramBase = idx * 13;
          return `($${paramBase + 1}, $${paramBase + 2}, $${paramBase + 3}, $${paramBase + 4}, $${paramBase + 5}, $${paramBase + 6}, $${paramBase + 7}, $${paramBase + 8}, $${paramBase + 9}, $${paramBase + 10}, $${paramBase + 11}, $${paramBase + 12}, $${paramBase + 13})`;
        }).join(', ');
        
        const params = chunk.flatMap(lead => [
          lead.email,
          lead.first_name,
          lead.last_name,
          lead.organization,
          lead.title,
          lead.phone,
          lead.website,
          lead.city,
          lead.state,
          lead.country,
          lead.source,
          lead.source_file_id,
          lead.source_row_number
        ]);
        
        await db.query(
          `INSERT INTO leads (email, first_name, last_name, organization, title, phone, website, city, state, country, source, source_file_id, source_row_number)
           VALUES ${values}
           ON CONFLICT (email) DO NOTHING`,
          params
        );
      }
    
    const insertDuration = performance.now() - insertStart;
    
    // Test query performance
    const queryStart = performance.now();
    const result = await db.query(
      'SELECT COUNT(*) as count FROM leads WHERE source = $1',
      ['stress_test']
    );
    const queryDuration = performance.now() - queryStart;
    
    const totalDuration = performance.now() - startTime;
    
    testResults.performance.database.push({
      test: testName,
      batchSize,
      insertDuration,
      queryDuration,
      totalDuration,
      insertsPerSecond: (batchSize / insertDuration) * 1000,
      queriesPerSecond: (1 / queryDuration) * 1000
    });
    
    return {
      success: true,
      batchSize,
      insertDuration,
      queryDuration,
      totalDuration
    };
  } catch (error) {
    testResults.errors.push({
      test: testName,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test Memory Usage
 */
function testMemoryUsage() {
  const usage = process.memoryUsage();
  const timestamp = Date.now();
  
  testResults.performance.memory.push({
    timestamp,
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    rss: usage.rss,
    arrayBuffers: usage.arrayBuffers
  });
  
  // Check for potential memory leak
  if (testResults.performance.memory.length > 1) {
    const previous = testResults.performance.memory[testResults.performance.memory.length - 2];
    const growth = usage.heapUsed - previous.heapUsed;
    const timeDelta = timestamp - previous.timestamp;
    const growthRate = growth / timeDelta; // bytes per ms
    
    if (growthRate > 1000) { // More than 1KB per ms
      testResults.memoryLeaks.push({
        timestamp,
        growthRate,
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        warning: 'Potential memory leak detected'
      });
    }
  }
  
  return usage;
}

/**
 * Test API Rate Limits
 */
async function testAPIRateLimits() {
  const testName = 'API Rate Limit Test';
  const startTime = performance.now();
  
  try {
    // Test health check endpoint (simulates API calls)
    const http = require('http');
    const requests = [];
    const concurrentRequests = 100;
    
    const makeRequest = () => {
      return new Promise((resolve) => {
        const req = http.get('http://localhost:7101/health', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve({ error: 'Invalid JSON response' });
            }
          });
        });
        
        req.on('error', (err) => {
          resolve({ error: err.message });
        });
        
        req.setTimeout(5000, () => {
          req.destroy();
          resolve({ error: 'Request timeout' });
        });
      });
    };
    
    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(makeRequest());
    }
    
    const results = await Promise.all(requests);
    const successCount = results.filter(r => !r.error && r.status).length;
    const errorCount = results.filter(r => r.error || !r.status).length;
    const duration = performance.now() - startTime;
    
    testResults.performance.rateLimits.push({
      test: testName,
      concurrentRequests,
      successCount,
      errorCount,
      duration,
      requestsPerSecond: (concurrentRequests / duration) * 1000
    });
    
    // Check for rate limit errors
    const rateLimitErrors = results.filter(r => 
      r.error && (r.error.includes('rate limit') || r.error.includes('429') || r.error.includes('Too many'))
    );
    
    if (rateLimitErrors.length > 0) {
      testResults.bottlenecks.push({
        type: 'rate_limit',
        count: rateLimitErrors.length,
        message: 'Rate limit errors detected',
        timestamp: new Date().toISOString()
      });
    }
    
    return {
      success: true,
      concurrentRequests,
      successCount,
      errorCount,
      duration
    };
  } catch (error) {
    testResults.errors.push({
      test: testName,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test Database Connection Pool
 */
async function testDatabaseConnectionPool() {
  const testName = 'Database Connection Pool';
  const startTime = performance.now();
  
  try {
    const concurrentQueries = 50;
    const queries = [];
    
    for (let i = 0; i < concurrentQueries; i++) {
      queries.push(
        db.query('SELECT NOW(), pg_sleep(0.1)')
          .catch(err => ({ error: err.message }))
      );
    }
    
    const results = await Promise.all(queries);
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;
    const duration = performance.now() - startTime;
    
    if (errorCount > 0) {
      testResults.bottlenecks.push({
        type: 'database_pool',
        count: errorCount,
        message: 'Database connection pool exhausted',
        timestamp: new Date().toISOString()
      });
    }
    
    return {
      success: true,
      concurrentQueries,
      successCount,
      errorCount,
      duration
    };
  } catch (error) {
    testResults.errors.push({
      test: testName,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test Error Recovery
 */
async function testErrorRecovery() {
  const testName = 'Error Recovery';
  
  try {
    // Test with invalid data
    const invalidLead = {
      email: null, // Invalid email
      first_name: 'Test',
      last_name: 'User'
    };
    
    try {
      await db.query(
        'INSERT INTO leads (email, first_name, last_name) VALUES ($1, $2, $3)',
        [invalidLead.email, invalidLead.first_name, invalidLead.last_name]
      );
    } catch (error) {
      // Expected error - test recovery
      const recoveryStart = performance.now();
      
      // System should continue processing
      const validLead = generateTestLead(999999);
      await db.query(
        'INSERT INTO leads (email, first_name, last_name) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
        [validLead.email, validLead.first_name, validLead.last_name]
      );
      
      const recoveryDuration = performance.now() - recoveryStart;
      
      return {
        success: true,
        errorHandled: true,
        recoveryDuration
      };
    }
    
    return {
      success: false,
      error: 'Expected error did not occur'
    };
  } catch (error) {
    testResults.errors.push({
      test: testName,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run comprehensive stress test
 */
async function runStressTest() {
  console.log('🚀 Starting Comprehensive Stress Test');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total Resources: ${TEST_CONFIG.totalResources.toLocaleString()}`);
  console.log(`Batch Size: ${TEST_CONFIG.batchSize.toLocaleString()}`);
  console.log(`Concurrent Batches: ${TEST_CONFIG.concurrentBatches}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  testResults.startTime = performance.now();
  testResults.totalResources = TEST_CONFIG.totalResources;
  
  // Initial memory snapshot
  testMemoryUsage();
  
  try {
    // Phase 1: Database Performance Tests
    if (TEST_CONFIG.enableDatabaseTests) {
      console.log('📊 Phase 1: Database Performance Tests');
      console.log('─────────────────────────────────────────────');
      
      for (let batch = 0; batch < Math.ceil(TEST_CONFIG.totalResources / TEST_CONFIG.batchSize); batch++) {
        const batchStart = batch * TEST_CONFIG.batchSize;
        const batchEnd = Math.min(batchStart + TEST_CONFIG.batchSize, TEST_CONFIG.totalResources);
        const currentBatchSize = batchEnd - batchStart;
        
        console.log(`Batch ${batch + 1}/${Math.ceil(TEST_CONFIG.totalResources / TEST_CONFIG.batchSize)}: Processing ${currentBatchSize.toLocaleString()} resources...`);
        
      const result = await testDatabasePerformance(currentBatchSize);
      
      if (result.success) {
        testResults.processed += currentBatchSize;
        const insertsPerSecond = result.insertDuration > 0 ? (currentBatchSize / result.insertDuration) * 1000 : 0;
        console.log(`  ✅ Processed ${currentBatchSize.toLocaleString()} resources in ${(result.totalDuration / 1000).toFixed(2)}s`);
        console.log(`  📈 ${insertsPerSecond.toFixed(0)} inserts/sec`);
      } else {
        testResults.failed += currentBatchSize;
        console.log(`  ❌ Failed: ${result.error}`);
      }
        
        // Memory check every 10 batches
        if (batch % 10 === 0) {
          testMemoryUsage();
        }
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('');
    }
    
    // Phase 2: API Rate Limit Tests
    if (TEST_CONFIG.enableRateLimitTests) {
      console.log('🌐 Phase 2: API Rate Limit Tests');
      console.log('─────────────────────────────────────────────');
      
      const rateLimitResult = await testAPIRateLimits();
      if (rateLimitResult.success) {
        console.log(`  ✅ ${rateLimitResult.successCount}/${rateLimitResult.concurrentRequests} requests succeeded`);
        console.log(`  ⏱️  ${(rateLimitResult.requestsPerSecond || 0).toFixed(0)} requests/sec`);
      } else {
        console.log(`  ❌ Failed: ${rateLimitResult.error}`);
      }
      console.log('');
    }
    
    // Phase 3: Database Connection Pool Tests
    if (TEST_CONFIG.enableDatabaseTests) {
      console.log('🔌 Phase 3: Database Connection Pool Tests');
      console.log('─────────────────────────────────────────────');
      
      const poolResult = await testDatabaseConnectionPool();
      if (poolResult.success) {
        console.log(`  ✅ ${poolResult.successCount}/${poolResult.concurrentQueries} queries succeeded`);
      } else {
        console.log(`  ❌ Failed: ${poolResult.error}`);
      }
      console.log('');
    }
    
    // Phase 4: Error Recovery Tests
    console.log('🛡️  Phase 4: Error Recovery Tests');
    console.log('─────────────────────────────────────────────');
    
    const recoveryResult = await testErrorRecovery();
    if (recoveryResult.success) {
      console.log(`  ✅ Error handled and system recovered`);
      console.log(`  ⏱️  Recovery time: ${(recoveryResult.recoveryDuration || 0).toFixed(2)}ms`);
    } else {
      console.log(`  ❌ Failed: ${recoveryResult.error}`);
    }
    console.log('');
    
    // Final memory snapshot
    testMemoryUsage();
    
    // Calculate final statistics
    testResults.endTime = performance.now();
    testResults.duration = testResults.endTime - testResults.startTime;
    
    // Generate report
    await generateReport();
    
  } catch (error) {
    logger.error('Stress test error:', error);
    testResults.failures.push({
      type: 'critical_error',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    await generateReport();
    throw error;
  }
}

/**
 * Generate comprehensive test report
 */
async function generateReport() {
  const reportPath = path.join(__dirname, '../stress-test-report.json');
  const reportHtmlPath = path.join(__dirname, '../stress-test-report.html');
  
  // Calculate statistics
  const stats = {
    totalDuration: testResults.duration,
    durationMinutes: (testResults.duration / 60000).toFixed(2),
    totalResources: testResults.totalResources,
    processed: testResults.processed,
    failed: testResults.failed,
    successRate: ((testResults.processed / testResults.totalResources) * 100).toFixed(2) + '%',
    errors: testResults.errors.length,
    bottlenecks: testResults.bottlenecks.length,
    memoryLeaks: testResults.memoryLeaks.length
  };
  
  // Database performance stats
  if (testResults.performance.database.length > 0) {
    const dbPerf = testResults.performance.database;
    stats.database = {
      averageInsertDuration: (dbPerf.reduce((sum, p) => sum + p.insertDuration, 0) / dbPerf.length).toFixed(2) + 'ms',
      averageQueryDuration: (dbPerf.reduce((sum, p) => sum + p.queryDuration, 0) / dbPerf.length).toFixed(2) + 'ms',
      averageInsertsPerSecond: (dbPerf.reduce((sum, p) => sum + p.insertsPerSecond, 0) / dbPerf.length).toFixed(0),
      totalBatches: dbPerf.length
    };
  }
  
  // Memory stats
  if (testResults.performance.memory.length > 0) {
    const mem = testResults.performance.memory;
    const initial = mem[0];
    const final = mem[mem.length - 1];
    stats.memory = {
      initialHeapUsed: (initial.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
      finalHeapUsed: (final.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
      heapGrowth: ((final.heapUsed - initial.heapUsed) / 1024 / 1024).toFixed(2) + 'MB',
      initialRSS: (initial.rss / 1024 / 1024).toFixed(2) + 'MB',
      finalRSS: (final.rss / 1024 / 1024).toFixed(2) + 'MB',
      rssGrowth: ((final.rss - initial.rss) / 1024 / 1024).toFixed(2) + 'MB'
    };
  }
  
  // Save JSON report
  const report = {
    summary: stats,
    testConfig: TEST_CONFIG,
    results: testResults,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(stats, report);
  fs.writeFileSync(reportHtmlPath, htmlReport);
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 STRESS TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Duration: ${stats.durationMinutes} minutes`);
  console.log(`Processed: ${stats.processed.toLocaleString()}/${stats.totalResources.toLocaleString()} (${stats.successRate})`);
  console.log(`Failed: ${stats.failed.toLocaleString()}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Bottlenecks: ${stats.bottlenecks}`);
  console.log(`Memory Leaks: ${stats.memoryLeaks}`);
  console.log('');
  console.log(`📄 Reports saved:`);
  console.log(`   JSON: ${reportPath}`);
  console.log(`   HTML: ${reportHtmlPath}`);
  console.log('═══════════════════════════════════════════════════════');
}

/**
 * Generate HTML report
 */
function generateHtmlReport(stats, report) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Stress Test Report - HingeCraft ML Automation</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card { background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50; }
    .stat-value { font-size: 2em; font-weight: bold; color: #4CAF50; }
    .stat-label { color: #666; margin-top: 5px; }
    .error { color: #f44336; }
    .warning { color: #ff9800; }
    .success { color: #4CAF50; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #4CAF50; color: white; }
    tr:hover { background: #f5f5f5; }
    .bottleneck { background: #fff3cd; padding: 10px; margin: 10px 0; border-left: 4px solid #ff9800; }
    .memory-leak { background: #f8d7da; padding: 10px; margin: 10px 0; border-left: 4px solid #f44336; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Stress Test Report - HingeCraft ML Automation System</h1>
    <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Total Resources Tested:</strong> ${stats.totalResources.toLocaleString()}</p>
    
    <h2>📊 Summary Statistics</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.durationMinutes}</div>
        <div class="stat-label">Duration (minutes)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value ${stats.successRate.includes('100') ? 'success' : 'warning'}">${stats.successRate}</div>
        <div class="stat-label">Success Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.processed.toLocaleString()}</div>
        <div class="stat-label">Processed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value ${stats.failed > 0 ? 'error' : 'success'}">${stats.failed.toLocaleString()}</div>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value ${stats.errors > 0 ? 'error' : 'success'}">${stats.errors}</div>
        <div class="stat-label">Errors</div>
      </div>
      <div class="stat-card">
        <div class="stat-value ${stats.bottlenecks > 0 ? 'warning' : 'success'}">${stats.bottlenecks}</div>
        <div class="stat-label">Bottlenecks</div>
      </div>
      <div class="stat-card">
        <div class="stat-value ${stats.memoryLeaks > 0 ? 'error' : 'success'}">${stats.memoryLeaks}</div>
        <div class="stat-label">Memory Leaks</div>
      </div>
    </div>
    
    ${stats.database ? `
    <h2>💾 Database Performance</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Average Insert Duration</td><td>${stats.database.averageInsertDuration}</td></tr>
      <tr><td>Average Query Duration</td><td>${stats.database.averageQueryDuration}</td></tr>
      <tr><td>Average Inserts/Second</td><td>${stats.database.averageInsertsPerSecond}</td></tr>
      <tr><td>Total Batches</td><td>${stats.database.totalBatches}</td></tr>
    </table>
    ` : ''}
    
    ${stats.memory ? `
    <h2>🧠 Memory Usage</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Initial Heap Used</td><td>${stats.memory.initialHeapUsed}</td></tr>
      <tr><td>Final Heap Used</td><td>${stats.memory.finalHeapUsed}</td></tr>
      <tr><td>Heap Growth</td><td>${stats.memory.heapGrowth}</td></tr>
      <tr><td>Initial RSS</td><td>${stats.memory.initialRSS}</td></tr>
      <tr><td>Final RSS</td><td>${stats.memory.finalRSS}</td></tr>
      <tr><td>RSS Growth</td><td>${stats.memory.rssGrowth}</td></tr>
    </table>
    ` : ''}
    
    ${report.results.bottlenecks.length > 0 ? `
    <h2>⚠️ Bottlenecks Detected</h2>
    ${report.results.bottlenecks.map(b => `
      <div class="bottleneck">
        <strong>${b.type}</strong>: ${b.message}<br>
        <small>Count: ${b.count} | Time: ${b.timestamp}</small>
      </div>
    `).join('')}
    ` : ''}
    
    ${report.results.memoryLeaks.length > 0 ? `
    <h2>🔴 Memory Leaks Detected</h2>
    ${report.results.memoryLeaks.map(leak => `
      <div class="memory-leak">
        <strong>Warning:</strong> ${leak.warning}<br>
        <small>Growth Rate: ${(leak.growthRate / 1024).toFixed(2)} KB/ms | Heap: ${(leak.heapUsed / 1024 / 1024).toFixed(2)} MB</small>
      </div>
    `).join('')}
    ` : ''}
    
    ${report.results.errors.length > 0 ? `
    <h2>❌ Errors</h2>
    <table>
      <tr><th>Test</th><th>Error</th><th>Time</th></tr>
      ${report.results.errors.map(e => `
        <tr>
          <td>${e.test}</td>
          <td>${e.error}</td>
          <td>${e.timestamp}</td>
        </tr>
      `).join('')}
    </table>
    ` : ''}
  </div>
</body>
</html>`;
}

// Run stress test if executed directly
if (require.main === module) {
  runStressTest()
    .then(() => {
      console.log('\n✅ Stress test completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Stress test failed:', error);
      process.exit(1);
    });
}

module.exports = { runStressTest, generateTestLead };

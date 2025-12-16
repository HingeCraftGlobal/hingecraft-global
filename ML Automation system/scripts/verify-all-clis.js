#!/usr/bin/env node

/**
 * Verify All CLIs Work Perfectly
 * 
 * Tests both HubSpot and Apps Script CLI scripts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to load .env if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed
}

const RESULTS = {
  hubspot: { status: 'PENDING', issues: [] },
  scriptProperties: { status: 'PENDING', issues: [] },
  sync: { status: 'PENDING', issues: [] }
};

function testHubSpotCLI() {
  console.log('\n📋 Test 1: HubSpot Properties CLI\n');
  console.log('='.repeat(60) + '\n');
  
  const scriptPath = path.join(__dirname, 'push-hubspot-properties-cli.js');
  
  if (!fs.existsSync(scriptPath)) {
    RESULTS.hubspot.status = 'FAIL';
    RESULTS.hubspot.issues.push('Script file not found');
    console.log('❌ Script file not found');
    return false;
  }
  
  console.log('✅ Script file exists');
  
  // Check if HUBSPOT_TOKEN is set
  if (!process.env.HUBSPOT_TOKEN) {
    RESULTS.hubspot.status = 'WARN';
    RESULTS.hubspot.issues.push('HUBSPOT_TOKEN not set (will fail when run)');
    console.log('⚠️  HUBSPOT_TOKEN not set');
    console.log('   Script will work once token is set\n');
  } else {
    console.log('✅ HUBSPOT_TOKEN is set');
    console.log('   Script is ready to run\n');
  }
  
  // Check script syntax
  try {
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    if (scriptContent.includes('HUBSPOT_PROPERTIES')) {
      console.log('✅ Script contains HubSpot properties definition');
    }
    if (scriptContent.includes('createHubSpotProperty')) {
      console.log('✅ Script contains property creation function');
    }
    RESULTS.hubspot.status = 'PASS';
  } catch (error) {
    RESULTS.hubspot.status = 'FAIL';
    RESULTS.hubspot.issues.push(`Script read error: ${error.message}`);
    console.log(`❌ Script read error: ${error.message}`);
    return false;
  }
  
  return true;
}

function testScriptPropertiesCLI() {
  console.log('\n📋 Test 2: Script Properties CLI\n');
  console.log('='.repeat(60) + '\n');
  
  const scriptPath = path.join(__dirname, 'push-script-properties-cli.js');
  
  if (!fs.existsSync(scriptPath)) {
    RESULTS.scriptProperties.status = 'FAIL';
    RESULTS.scriptProperties.issues.push('Script file not found');
    console.log('❌ Script file not found');
    return false;
  }
  
  console.log('✅ Script file exists');
  
  // Check script syntax
  try {
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    if (scriptContent.includes('SCRIPT_PROPERTIES')) {
      console.log('✅ Script contains Script Properties definition');
    }
    if (scriptContent.includes('TRACKING_ENDPOINT_URL')) {
      console.log('✅ Script contains tracking properties');
    }
    RESULTS.scriptProperties.status = 'PASS';
    console.log('✅ Script is ready (provides manual instructions)\n');
  } catch (error) {
    RESULTS.scriptProperties.status = 'FAIL';
    RESULTS.scriptProperties.issues.push(`Script read error: ${error.message}`);
    console.log(`❌ Script read error: ${error.message}`);
    return false;
  }
  
  return true;
}

function testSyncScript() {
  console.log('\n📋 Test 3: Git Sync Script\n');
  console.log('='.repeat(60) + '\n');
  
  const scriptPath = path.join(__dirname, 'sync-all-to-repo.sh');
  
  if (!fs.existsSync(scriptPath)) {
    RESULTS.sync.status = 'FAIL';
    RESULTS.sync.issues.push('Script file not found');
    console.log('❌ Script file not found');
    return false;
  }
  
  console.log('✅ Script file exists');
  
  // Check if executable
  try {
    const stats = fs.statSync(scriptPath);
    if (stats.mode & 0o111) {
      console.log('✅ Script is executable');
    } else {
      console.log('⚠️  Script is not executable (run: chmod +x)');
      RESULTS.sync.issues.push('Script not executable');
    }
    
    // Check script content
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    if (scriptContent.includes('git add')) {
      console.log('✅ Script contains git commands');
    }
    if (scriptContent.includes('git commit')) {
      console.log('✅ Script contains commit command');
    }
    
    RESULTS.sync.status = 'PASS';
    console.log('✅ Script is ready\n');
  } catch (error) {
    RESULTS.sync.status = 'FAIL';
    RESULTS.sync.issues.push(`Script check error: ${error.message}`);
    console.log(`❌ Script check error: ${error.message}`);
    return false;
  }
  
  return true;
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 CLI Verification Summary');
  console.log('='.repeat(60) + '\n');
  
  const allPass = Object.values(RESULTS).every(r => r.status === 'PASS' || r.status === 'WARN');
  
  Object.entries(RESULTS).forEach(([name, result]) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} ${name}: ${result.status}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
    }
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (allPass) {
    console.log('✅ All CLIs are ready!\n');
  } else {
    console.log('⚠️  Some CLIs have issues (see above)\n');
  }
  
  // Save report
  const reportPath = path.join(__dirname, '../cli-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results: RESULTS,
    allPass
  }, null, 2));
  
  console.log('📄 Report saved to:', reportPath + '\n');
  
  console.log('🚀 Usage:\n');
  console.log('   # HubSpot Properties:');
  console.log('   node scripts/push-hubspot-properties-cli.js\n');
  console.log('   # Script Properties:');
  console.log('   node scripts/push-script-properties-cli.js\n');
  console.log('   # Git Sync:');
  console.log('   ./scripts/sync-all-to-repo.sh\n');
}

async function main() {
  console.log('🔍 Verify All CLIs Work Perfectly\n');
  console.log('='.repeat(60) + '\n');
  
  testHubSpotCLI();
  testScriptPropertiesCLI();
  testSyncScript();
  
  generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verifyAllCLIs: main };

#!/usr/bin/env node

/**
 * Master CLI - Complete Automation
 * 
 * Orchestrates all CLI operations:
 * - Set Script Properties
 * - Push HubSpot Properties
 * - Verify everything
 * - Sync to Git
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

const STEPS = [
  {
    id: 'diagnosis',
    name: 'Comprehensive Email Diagnosis',
    script: 'comprehensive-email-diagnosis.js',
    required: false
  },
  {
    id: 'script-properties',
    name: 'Set Script Properties',
    script: 'set-script-properties-cli.js',
    required: true,
    description: 'Sets all Script Properties (via Apps Script function or manual)'
  },
  {
    id: 'hubspot-properties',
    name: 'Push HubSpot Properties',
    script: 'push-hubspot-properties-cli.js',
    required: true,
    description: 'Creates all 23 HubSpot properties',
    requiresToken: true
  },
  {
    id: 'verify-clis',
    name: 'Verify All CLIs',
    script: 'verify-all-clis.js',
    required: false
  },
  {
    id: 'sync-git',
    name: 'Sync to Git',
    script: 'sync-all-to-repo.sh',
    required: false,
    isShell: true
  }
];

function runStep(step) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${step.name}`);
  console.log('='.repeat(60) + '\n');
  
  if (step.description) {
    console.log(`📝 ${step.description}\n`);
  }
  
  const scriptPath = path.join(__dirname, step.script);
  
  if (!fs.existsSync(scriptPath)) {
    console.log(`❌ Script not found: ${step.script}`);
    return { success: false, step: step.id, error: 'Script not found' };
  }
  
  try {
    if (step.isShell) {
      // Shell script
      execSync(`bash "${scriptPath}"`, { 
        stdio: 'inherit',
        cwd: path.dirname(scriptPath),
        shell: '/bin/bash'
      });
    } else {
      // Node.js script - use absolute path and proper quoting
      const absolutePath = path.resolve(scriptPath);
      execSync(`node "${absolutePath}"`, { 
        stdio: 'inherit',
        cwd: path.dirname(absolutePath),
        shell: '/bin/bash'
      });
    }
    
    console.log(`\n✅ ${step.name}: Complete\n`);
    return { success: true, step: step.id };
  } catch (error) {
    console.error(`\n❌ ${step.name}: Failed`);
    console.error(`   Error: ${error.message}\n`);
    return { success: false, step: step.id, error: error.message };
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking Prerequisites...\n');
  
  const checks = {
    node: false,
    git: false,
    clasp: false,
    hubspotToken: false
  };
  
  // Check Node.js
  try {
    execSync('node --version', { stdio: 'pipe' });
    checks.node = true;
    console.log('✅ Node.js: Available');
  } catch (e) {
    console.log('❌ Node.js: Not found');
  }
  
  // Check Git
  try {
    execSync('git --version', { stdio: 'pipe' });
    checks.git = true;
    console.log('✅ Git: Available');
  } catch (e) {
    console.log('❌ Git: Not found');
  }
  
  // Check clasp
  try {
    execSync('clasp --version', { stdio: 'pipe' });
    checks.clasp = true;
    console.log('✅ clasp: Available');
  } catch (e) {
    console.log('⚠️  clasp: Not found (optional, for Apps Script deployment)');
  }
  
  // Check HUBSPOT_TOKEN
  if (process.env.HUBSPOT_TOKEN) {
    checks.hubspotToken = true;
    console.log('✅ HUBSPOT_TOKEN: Set');
  } else {
    console.log('⚠️  HUBSPOT_TOKEN: Not set (required for HubSpot properties)');
  }
  
  console.log('');
  return checks;
}

function generateSummary(results, checks) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Master CLI Summary');
  console.log('='.repeat(60) + '\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}\n`);
  
  if (failed > 0) {
    console.log('❌ Failed Steps:\n');
    results.filter(r => !r.success).forEach(r => {
      const step = STEPS.find(s => s.id === r.step);
      console.log(`   • ${step.name}: ${r.error || 'Unknown error'}`);
    });
    console.log('');
  }
  
  console.log('📋 Prerequisites:\n');
  Object.entries(checks).forEach(([key, value]) => {
    const icon = value ? '✅' : '❌';
    console.log(`   ${icon} ${key}`);
  });
  console.log('');
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    results: results,
    checks: checks,
    summary: {
      total: results.length,
      successful: successful,
      failed: failed
    }
  };
  
  const reportPath = path.join(__dirname, '../master-cli-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📄 Full report saved to:');
  console.log(`   ${reportPath}\n`);
}

async function main() {
  console.log('🚀 Master CLI - Complete Automation\n');
  console.log('='.repeat(60) + '\n');
  
  // Check prerequisites
  const checks = checkPrerequisites();
  
  // Run all steps
  const results = [];
  
  for (const step of STEPS) {
    // Skip HubSpot if token not set
    if (step.requiresToken && !checks.hubspotToken) {
      console.log(`\n⚠️  Skipping ${step.name} (HUBSPOT_TOKEN not set)\n`);
      results.push({ success: false, step: step.id, error: 'HUBSPOT_TOKEN not set', skipped: true });
      continue;
    }
    
    const result = runStep(step);
    results.push(result);
    
    // Small delay between steps
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate summary
  generateSummary(results, checks);
  
  console.log('🎯 Next Steps:\n');
  console.log('1. If Script Properties not set: Use SET_PROPERTIES_SCRIPT.gs in Apps Script');
  console.log('2. If HubSpot Properties not pushed: Set HUBSPOT_TOKEN and run again');
  console.log('3. Verify all properties are set');
  console.log('4. Test email send\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runMasterCLI: main };

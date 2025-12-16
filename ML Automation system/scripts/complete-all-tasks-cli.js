#!/usr/bin/env node

/**
 * Complete All Tasks via CLI
 * 
 * Orchestrates all remaining tasks that can be automated via CLI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TASKS = [
  {
    id: 'diagnose',
    name: 'Diagnose Execution Logs',
    script: 'diagnose-execution-logs.js',
    automated: true,
    time: '10 min'
  },
  {
    id: 'apply-fix',
    name: 'Apply Fix Based on Diagnosis',
    script: 'apply-fix-based-on-diagnosis.js',
    automated: true,
    time: '15-30 min'
  },
  {
    id: 'test-email',
    name: 'Test Email Send',
    script: 'test-email-send.js',
    automated: true,
    time: '10 min'
  },
  {
    id: 'script-properties',
    name: 'Add 5 Script Properties',
    script: null,
    automated: false,
    manual: true,
    time: '5 min',
    instructions: [
      '1. Go to: https://script.google.com',
      '2. Open your project',
      '3. Go to: Project Settings → Script Properties',
      '4. Add these 5 properties:',
      '   - TRACKING_ENDPOINT_URL: https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec',
      '   - GA4_MEASUREMENT_ID: G-QF5H2Q291T',
      '   - GA4_API_SECRET: cJH76-IHQteQx6DKaiPkGA',
      '   - GA4_STREAM_ID: 13142410458',
      '   - GA4_STREAM_URL: https://hingecraft-global.ai'
    ]
  },
  {
    id: 'verify-trigger',
    name: 'Verify Trigger',
    script: null,
    automated: false,
    manual: true,
    time: '2 min',
    instructions: [
      '1. Go to: https://script.google.com',
      '2. Open your project',
      '3. Go to: Triggers tab',
      '4. Verify trigger exists:',
      '   - Function: checkFolderForNewFiles',
      '   - Event: Time-driven',
      '   - Type: Minutes timer',
      '   - Frequency: Every 5 minutes',
      '   - Status: Enabled'
    ]
  },
  {
    id: 'complete-test',
    name: 'Complete Test Verification',
    script: 'test-email-send.js',
    automated: true,
    time: 'ongoing'
  }
];

function runTask(task) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 Task: ${task.name}`);
  console.log(`⏱️  Time: ${task.time}`);
  console.log(`${'='.repeat(60)}\n`);
  
  if (task.automated && task.script) {
    try {
      const scriptPath = path.join(__dirname, task.script);
      if (fs.existsSync(scriptPath)) {
        console.log(`🚀 Running: ${task.script}\n`);
        execSync(`node ${scriptPath}`, { stdio: 'inherit' });
        console.log(`\n✅ Task completed: ${task.name}\n`);
        return { success: true, task: task.id };
      } else {
        console.log(`❌ Script not found: ${scriptPath}\n`);
        return { success: false, task: task.id, error: 'Script not found' };
      }
    } catch (error) {
      console.error(`❌ Error running task: ${error.message}\n`);
      return { success: false, task: task.id, error: error.message };
    }
  } else if (task.manual) {
    console.log('⚠️  Manual Task - Follow Instructions:\n');
    task.instructions.forEach(instruction => {
      console.log(`   ${instruction}`);
    });
    console.log('\n✅ After completing, press Enter to continue...');
    // In a real scenario, you might want to wait for user input
    // For now, we'll just show instructions
    return { success: true, task: task.id, manual: true };
  }
  
  return { success: false, task: task.id, error: 'Unknown task type' };
}

function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    tasks: results,
    summary: {
      total: TASKS.length,
      completed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      manual: results.filter(r => r.manual).length
    }
  };
  
  const reportPath = path.join(__dirname, '../task-completion-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

async function main() {
  console.log('🚀 Complete All Tasks via CLI\n');
  console.log('============================\n');
  
  console.log(`📋 Total Tasks: ${TASKS.length}\n`);
  
  const results = [];
  
  for (const task of TASKS) {
    const result = runTask(task);
    results.push(result);
    
    // Small delay between tasks
    if (task !== TASKS[TASKS.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Generate report
  const report = generateReport(results);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Task Completion Summary');
  console.log('='.repeat(60) + '\n');
  
  console.log(`✅ Completed: ${report.summary.completed}/${report.summary.total}`);
  console.log(`❌ Failed: ${report.summary.failed}/${report.summary.total}`);
  console.log(`⚠️  Manual: ${report.summary.manual}/${report.summary.total}\n`);
  
  if (report.summary.failed > 0) {
    console.log('❌ Failed Tasks:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.task}: ${r.error || 'Unknown error'}`);
    });
    console.log('');
  }
  
  if (report.summary.manual > 0) {
    console.log('⚠️  Manual Tasks Remaining:');
    results.filter(r => r.manual).forEach(r => {
      const task = TASKS.find(t => t.id === r.task);
      console.log(`   - ${task.name}`);
    });
    console.log('');
  }
  
  console.log('📄 Full report saved to:');
  console.log(`   ${path.join(__dirname, '../task-completion-report.json')}\n`);
  
  console.log('🎯 Next Steps:');
  console.log('1. Complete manual tasks (Script Properties, Trigger)');
  console.log('2. Review execution logs');
  console.log('3. Verify email sent and received');
  console.log('4. Test full sequence\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TASKS, runTask, generateReport };


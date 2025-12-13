#!/usr/bin/env node

/**
 * Test All Supported File Types
 * Verifies that all spreadsheet file types are properly detected and can be processed
 */

const fileProcessor = require('../src/services/fileProcessor');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testFileTypeDetection() {
  log('\n═══════════════════════════════════════════════════════════════════════════════', 'cyan');
  log('🧪 TESTING ALL SUPPORTED FILE TYPES', 'bright');
  log('═══════════════════════════════════════════════════════════════════════════════\n', 'cyan');

  const testCases = [
    // Excel formats
    { filename: 'leads.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', expected: 'xlsx' },
    { filename: 'leads.xls', mimeType: 'application/vnd.ms-excel', expected: 'xls' },
    { filename: 'leads.xlsm', mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12', expected: 'xlsm' },
    { filename: 'template.xltx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template', expected: 'xltx' },
    { filename: 'template.xltm', mimeType: 'application/vnd.ms-excel.template.macroEnabled.12', expected: 'xltm' },
    
    // Google Sheets
    { filename: 'leads.gsheet', mimeType: 'application/vnd.google-apps.spreadsheet', expected: 'gsheet' },
    
    // Text formats
    { filename: 'leads.csv', mimeType: 'text/csv', expected: 'csv' },
    { filename: 'leads.tsv', mimeType: 'text/tab-separated-values', expected: 'tsv' },
    { filename: 'leads.txt', mimeType: 'text/plain', expected: 'txt' },
    { filename: 'leads.tab', mimeType: 'text/plain', expected: 'tab' },
    
    // OpenDocument
    { filename: 'leads.ods', mimeType: 'application/vnd.oasis.opendocument.spreadsheet', expected: 'ods' },
    
    // Edge cases
    { filename: 'leads.CSV', mimeType: 'application/csv', expected: 'csv' },
    { filename: 'leads', mimeType: 'text/csv', expected: 'csv' },
  ];

  log('📋 Testing File Type Detection...\n', 'blue');
  
  let passed = 0;
  let failed = 0;

  testCases.forEach((test, index) => {
    const detected = fileProcessor.detectFileType(test.filename, test.mimeType);
    const isSupported = fileProcessor.isSupported(test.filename, test.mimeType);
    
    if (detected === test.expected && isSupported) {
      log(`   ✅ Test ${index + 1}: ${test.filename} → ${detected}`, 'green');
      passed++;
    } else {
      log(`   ❌ Test ${index + 1}: ${test.filename} → Expected: ${test.expected}, Got: ${detected}`, 'red');
      failed++;
    }
  });

  log(`\n📊 Results: ${passed} passed, ${failed} failed`, failed === 0 ? 'green' : 'red');

  // Show supported types
  log('\n📋 Supported File Types:', 'blue');
  const supported = fileProcessor.getSupportedTypes();
  
  log(`\n   Extensions (${supported.extensions.length}):`, 'cyan');
  supported.extensions.forEach(ext => {
    log(`      ${ext}`, 'cyan');
  });

  log(`\n   MIME Types (${supported.mimeTypes.length}):`, 'cyan');
  supported.mimeTypes.forEach(mime => {
    log(`      ${mime}`, 'cyan');
  });

  log(`\n   Descriptions:`, 'cyan');
  Object.entries(supported.descriptions).forEach(([type, desc]) => {
    log(`      ${type}: ${desc}`, 'cyan');
  });

  log('\n═══════════════════════════════════════════════════════════════════════════════', 'cyan');
  
  if (failed === 0) {
    log('✅ All file types supported and detected correctly!', 'green');
    log('✅ System ready to process any spreadsheet format!', 'green');
  } else {
    log('⚠️  Some file types need attention', 'yellow');
  }
  
  log('═══════════════════════════════════════════════════════════════════════════════\n', 'cyan');
}

// Run tests
testFileTypeDetection();






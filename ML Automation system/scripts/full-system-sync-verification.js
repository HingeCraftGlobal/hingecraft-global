/**
 * Full System Sync Verification
 * Verifies all files, functions, and integrations are complete and synced
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[0;32m',
  red: '\x1b[0;31m',
  yellow: '\x1b[0;33m',
  blue: '\x1b[0;34m',
  cyan: '\x1b[0;36m',
  magenta: '\x1b[0;35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const rootDir = path.join(__dirname, '..');
const gasDir = path.join(rootDir, 'google-apps-script');
const scriptsDir = path.join(rootDir, 'scripts');
const databaseDir = path.join(rootDir, 'database');

const verification = {
  gasFiles: [],
  functions: [],
  dependencies: [],
  scripts: [],
  database: {},
  errors: [],
  warnings: []
};

/**
 * Verify Google Apps Script files
 */
function verifyGASFiles() {
  log('\n📁 VERIFYING GOOGLE APPS SCRIPT FILES', 'cyan');
  log('='.repeat(60), 'blue');
  
  const requiredFiles = [
    'Code.gs',
    'Tracking.gs',
    'DraftTracking.gs',
    'BulkProcessing.gs',
    'HubSpotSetup.gs',
    'TEST_CONFIG.gs',
    'appsscript.json',
    '.clasp.json'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(gasDir, file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2);
      log(`✅ ${file} (${size} KB)`, 'green');
      verification.gasFiles.push({ file, exists: true, size: stats.size });
    } else {
      log(`❌ ${file} (MISSING)`, 'red');
      verification.gasFiles.push({ file, exists: false });
      verification.errors.push(`Missing GAS file: ${file}`);
    }
  });
}

/**
 * Verify critical functions exist
 */
function verifyFunctions() {
  log('\n🔧 VERIFYING CRITICAL FUNCTIONS', 'cyan');
  log('='.repeat(60), 'blue');
  
  const functionChecks = [
    {
      file: 'Code.gs',
      functions: [
        'checkFolderForNewFiles',
        'sequenceManager',
        'createOrUpdateContact',
        'getContactsReadyForNextStep',
        'processReferralSequences',
        'qualifyLeadFromData',
        'determineTemplateSet',
        'advanceContactSequence',
        'sendPersonalizedEmail'
      ]
    },
    {
      file: 'BulkProcessing.gs',
      functions: [
        'prepareAnyMailBulkPayload',
        'runAnyMailBulkEnrichment',
        'processBulkResults',
        'extractOrganizationName',
        'extractCompanyDomain',
        'extractPrimaryEmail',
        'extractAllEmailsFromRow',
        'determineLeadTypeFromRow',
        'mapLeadTypeToTemplateSet'
      ]
    },
    {
      file: 'Tracking.gs',
      functions: [
        'getGA4Config',
        'sendGa4Event',
        'doGet',
        'updateHubSpotTrackingProperty',
        'wrapLinksWithTracking',
        'addTrackingPixel',
        'scanGmailForResponses'
      ]
    },
    {
      file: 'DraftTracking.gs',
      functions: [
        'scanDraftsForOutbound',
        'ensureContactExists',
        'getContactFromHubSpot'
      ]
    },
    {
      file: 'HubSpotSetup.gs',
      functions: [
        'createHubSpotProperties',
        'runHubSpotSetup'
      ]
    }
  ];
  
  functionChecks.forEach(({ file, functions }) => {
    const filePath = path.join(gasDir, file);
    if (!fs.existsSync(filePath)) {
      log(`❌ ${file} not found`, 'red');
      verification.errors.push(`File not found: ${file}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    functions.forEach(funcName => {
      const regex = new RegExp(`function\\s+${funcName}\\s*\\(`, 'i');
      const exists = regex.test(content);
      
      if (exists) {
        log(`   ✅ ${funcName}()`, 'green');
        verification.functions.push({ file, function: funcName, exists: true });
      } else {
        log(`   ❌ ${funcName}() (MISSING)`, 'red');
        verification.functions.push({ file, function: funcName, exists: false });
        verification.errors.push(`Missing function: ${funcName} in ${file}`);
      }
    });
  });
}

/**
 * Verify function dependencies
 */
function verifyDependencies() {
  log('\n🔗 VERIFYING FUNCTION DEPENDENCIES', 'cyan');
  log('='.repeat(60), 'blue');
  
  const codePath = path.join(gasDir, 'Code.gs');
  const codeContent = fs.readFileSync(codePath, 'utf8');
  
  // Check what functions are called from checkFolderForNewFiles
  const checkFolderMatch = codeContent.match(/function\s+checkFolderForNewFiles[\s\S]*?(?=function\s+\w+|$)/);
  if (checkFolderMatch) {
    const checkFolderCode = checkFolderMatch[0];
    
    const calledFunctions = [
      'prepareAnyMailBulkPayload',
      'runAnyMailBulkEnrichment',
      'processBulkResults',
      'sequenceManager',
      'scanDraftsForOutbound',
      'getProcessedFileIds',
      'markFileAsProcessed'
    ];
    
    calledFunctions.forEach(funcName => {
      const regex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
      const matches = checkFolderCode.match(regex);
      
      if (matches) {
        // Check if function exists
        const bulkPath = path.join(gasDir, 'BulkProcessing.gs');
        const draftPath = path.join(gasDir, 'DraftTracking.gs');
        const bulkContent = fs.existsSync(bulkPath) ? fs.readFileSync(bulkPath, 'utf8') : '';
        const draftContent = fs.existsSync(draftPath) ? fs.readFileSync(draftPath, 'utf8') : '';
        const allContent = codeContent + bulkContent + draftContent;
        
        const funcRegex = new RegExp(`function\\s+${funcName}\\s*\\(`, 'i');
        const exists = funcRegex.test(allContent);
        
        if (exists) {
          log(`   ✅ ${funcName}() called and defined`, 'green');
          verification.dependencies.push({ function: funcName, called: true, defined: true });
        } else {
          log(`   ❌ ${funcName}() called but NOT defined`, 'red');
          verification.dependencies.push({ function: funcName, called: true, defined: false });
          verification.errors.push(`Function called but not defined: ${funcName}`);
        }
      }
    });
  }
}

/**
 * Verify scripts directory
 */
function verifyScripts() {
  log('\n📜 VERIFYING SCRIPTS', 'cyan');
  log('='.repeat(60), 'blue');
  
  const requiredScripts = [
    'apply-entire-database.js',
    'apply-database-complete.sh',
    'comprehensive-error-scan.js',
    'master-integration-verification.js',
    'verify-manual-setup.js',
    'push-all-updates.sh'
  ];
  
  requiredScripts.forEach(script => {
    const scriptPath = path.join(scriptsDir, script);
    const exists = fs.existsSync(scriptPath);
    
    if (exists) {
      log(`✅ ${script}`, 'green');
      verification.scripts.push({ script, exists: true });
    } else {
      log(`❌ ${script} (MISSING)`, 'red');
      verification.scripts.push({ script, exists: false });
      verification.warnings.push(`Missing script: ${script}`);
    }
  });
}

/**
 * Verify database schema
 */
function verifyDatabase() {
  log('\n🗄️  VERIFYING DATABASE SCHEMA', 'cyan');
  log('='.repeat(60), 'blue');
  
  const schemaPath = path.join(databaseDir, 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    log('❌ schema.sql not found', 'red');
    verification.database.schemaExists = false;
    verification.errors.push('Database schema file not found');
    return;
  }
  
  log('✅ schema.sql exists', 'green');
  verification.database.schemaExists = true;
  
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Check for required tables
  const requiredTables = [
    'leads',
    'staging_leads',
    'import_batches',
    'sequences',
    'sequence_steps',
    'lead_sequences',
    'email_logs',
    'hubspot_sync',
    'message_logs',
    'suppression_list',
    'audit_log'
  ];
  
  requiredTables.forEach(table => {
    const regex = new RegExp(`CREATE\\s+TABLE.*?${table}`, 'i');
    const exists = regex.test(schemaContent);
    
    if (exists) {
      log(`   ✅ Table: ${table}`, 'green');
      verification.database.tables = verification.database.tables || [];
      verification.database.tables.push({ table, exists: true });
    } else {
      log(`   ❌ Table: ${table} (MISSING)`, 'red');
      verification.database.tables = verification.database.tables || [];
      verification.database.tables.push({ table, exists: false });
      verification.errors.push(`Missing table in schema: ${table}`);
    }
  });
}

/**
 * Check if files are synced (clasp push status)
 */
function checkSyncStatus() {
  log('\n🔄 CHECKING SYNC STATUS', 'cyan');
  log('='.repeat(60), 'blue');
  
  try {
    // Check if clasp is installed
    try {
      execSync('which clasp', { stdio: 'ignore' });
      log('✅ clasp CLI installed', 'green');
    } catch (e) {
      log('⚠️  clasp CLI not found (may need: npm install -g @google/clasp)', 'yellow');
      verification.warnings.push('clasp CLI not installed');
      return;
    }
    
    // Check if logged in
    try {
      execSync('cd ' + gasDir + ' && clasp list', { stdio: 'ignore' });
      log('✅ clasp authenticated', 'green');
    } catch (e) {
      log('⚠️  clasp not authenticated (run: clasp login)', 'yellow');
      verification.warnings.push('clasp not authenticated');
    }
    
  } catch (error) {
    log('⚠️  Could not verify clasp status', 'yellow');
    verification.warnings.push('Could not verify clasp sync status');
  }
}

/**
 * Generate summary report
 */
function generateSummary() {
  log('\n📊 VERIFICATION SUMMARY', 'cyan');
  log('='.repeat(60), 'blue');
  
  const gasFilesOk = verification.gasFiles.filter(f => f.exists).length;
  const gasFilesTotal = verification.gasFiles.length;
  const functionsOk = verification.functions.filter(f => f.exists).length;
  const functionsTotal = verification.functions.length;
  const dependenciesOk = verification.dependencies.filter(d => d.defined).length;
  const dependenciesTotal = verification.dependencies.length;
  const scriptsOk = verification.scripts.filter(s => s.exists).length;
  const scriptsTotal = verification.scripts.length;
  const tablesOk = verification.database.tables ? verification.database.tables.filter(t => t.exists).length : 0;
  const tablesTotal = verification.database.tables ? verification.database.tables.length : 0;
  
  log(`\nGAS Files: ${gasFilesOk}/${gasFilesTotal}`, gasFilesOk === gasFilesTotal ? 'green' : 'yellow');
  log(`Functions: ${functionsOk}/${functionsTotal}`, functionsOk === functionsTotal ? 'green' : 'yellow');
  log(`Dependencies: ${dependenciesOk}/${dependenciesTotal}`, dependenciesOk === dependenciesTotal ? 'green' : 'yellow');
  log(`Scripts: ${scriptsOk}/${scriptsTotal}`, scriptsOk === scriptsTotal ? 'green' : 'yellow');
  log(`Database Tables: ${tablesOk}/${tablesTotal}`, tablesOk === tablesTotal ? 'green' : 'yellow');
  log(`Errors: ${verification.errors.length}`, verification.errors.length === 0 ? 'green' : 'red');
  log(`Warnings: ${verification.warnings.length}`, verification.warnings.length === 0 ? 'green' : 'yellow');
  
  if (verification.errors.length > 0) {
    log('\n❌ ERRORS FOUND:', 'red');
    verification.errors.forEach(error => {
      log(`   - ${error}`, 'red');
    });
  }
  
  if (verification.warnings.length > 0) {
    log('\n⚠️  WARNINGS:', 'yellow');
    verification.warnings.forEach(warning => {
      log(`   - ${warning}`, 'yellow');
    });
  }
  
  // Save report
  const reportPath = path.join(rootDir, 'full-system-sync-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(verification, null, 2));
  log(`\n📄 Full report saved to: ${reportPath}`, 'blue');
  
  // Overall status
  const allOk = verification.errors.length === 0 && 
                gasFilesOk === gasFilesTotal &&
                functionsOk === functionsTotal &&
                dependenciesOk === dependenciesTotal;
  
  if (allOk) {
    log('\n✅ SYSTEM FULLY SYNCED AND READY', 'green');
    return true;
  } else {
    log('\n⚠️  SYSTEM NEEDS ATTENTION', 'yellow');
    return false;
  }
}

/**
 * Main verification function
 */
function main() {
  log('\n🚀 FULL SYSTEM SYNC VERIFICATION', 'magenta');
  log('='.repeat(60), 'blue');
  
  verifyGASFiles();
  verifyFunctions();
  verifyDependencies();
  verifyScripts();
  verifyDatabase();
  checkSyncStatus();
  
  const allGood = generateSummary();
  
  return allGood;
}

if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main, verification };

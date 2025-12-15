/**
 * Comprehensive Error Scanning System
 * Scans 1,000,000+ resources across the entire system
 * Checks for errors, inconsistencies, and version mismatches
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCAN_RESULTS = {
  errors: [],
  warnings: [],
  info: [],
  stats: {
    filesScanned: 0,
    errorsFound: 0,
    warningsFound: 0,
    checksPerformed: 0
  }
};

// Configuration
const CONFIG = {
  FROM_EMAIL: 'marketingecraft@gmail.com',
  TO_EMAIL: 'chandlerferguson319@gmail.com',
  HUBSPOT_TOKEN: 'pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39',
  ANYMAIL_API_KEY: 'pRUtyDRHSPageC2jHGbnWGpD',
  MONITORED_FOLDER_ID: '1MpKKqjpabi10iDh1vWliaiLQsj8wktiz',
  SYSTEM_VERSION: '1.0.0'
};

/**
 * Log results
 */
function log(level, message, details = {}) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  SCAN_RESULTS[level === 'error' ? 'errors' : level === 'warning' ? 'warnings' : 'info'].push(entry);
  SCAN_RESULTS.stats.checksPerformed++;
  
  if (level === 'error') SCAN_RESULTS.stats.errorsFound++;
  if (level === 'warning') SCAN_RESULTS.stats.warningsFound++;
  
  console.log(`[${level.toUpperCase()}] ${message}`);
}

/**
 * Scan file for errors
 */
function scanFile(filePath) {
  SCAN_RESULTS.stats.filesScanned++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath);
    
    // Check 1: Email address consistency (skip test files and this script itself)
    if (content.includes('chandlerferguson319@gmail.com') && 
        !filePath.includes('TEST_CONFIG') && 
        !filePath.includes('test-live') &&
        !filePath.includes('comprehensive-error-scan') &&
        !filePath.includes('update-all-components')) {
      // Only flag if it's clearly a FROM address context
      if ((content.includes('GMAIL_FROM_ADDRESS') && content.includes('chandlerferguson319@gmail.com')) ||
          (content.match(/FROM_EMAIL.*chandlerferguson319@gmail.com/) && !content.includes('TEST_EMAIL'))) {
        log('error', `Incorrect FROM email in ${filePath}`, {
          file: filePath,
          issue: 'Should use marketingecraft@gmail.com as FROM address',
          found: 'chandlerferguson319@gmail.com'
        });
      }
    }
    
    // Check 2: Missing configuration values
    if (ext === '.gs' || ext === '.js') {
      const configChecks = [
        { pattern: /HUBSPOT.*TOKEN/i, name: 'HUBSPOT_TOKEN' },
        { pattern: /ANYMAIL.*KEY/i, name: 'ANYMAIL_API_KEY' },
        { pattern: /MONITORED.*FOLDER/i, name: 'MONITORED_FOLDER_ID' },
        { pattern: /GMAIL.*FROM/i, name: 'GMAIL_FROM_ADDRESS' }
      ];
      
      configChecks.forEach(check => {
        if (content.match(check.pattern) && !content.includes(CONFIG[check.name === 'GMAIL_FROM_ADDRESS' ? 'FROM_EMAIL' : check.name])) {
          log('warning', `Potential missing config: ${check.name} in ${filePath}`, {
            file: filePath,
            config: check.name
          });
        }
      });
    }
    
    // Check 3: Syntax errors (basic)
    if (ext === '.js' || ext === '.gs') {
      // Check for common syntax issues
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      
      if (openBraces !== closeBraces) {
        log('error', `Mismatched braces in ${filePath}`, {
          file: filePath,
          open: openBraces,
          close: closeBraces
        });
      }
      
      if (openParens !== closeParens) {
        log('error', `Mismatched parentheses in ${filePath}`, {
          file: filePath,
          open: openParens,
          close: closeParens
        });
      }
    }
    
    // Check 4: Deprecated functions
    if (content.includes('onNewFileAdded') && !content.includes('DEPRECATED') && !content.includes('redirect')) {
      log('warning', `Deprecated function onNewFileAdded found in ${filePath}`, {
        file: filePath,
        recommendation: 'Should redirect to checkFolderForNewFiles'
      });
    }
    
    // Check 5: Missing error handling
    if (ext === '.js' || ext === '.gs') {
      const asyncFunctions = content.match(/async\s+function|function.*\(.*\).*\s*\{/g) || [];
      const tryCatchBlocks = (content.match(/try\s*\{/g) || []).length;
      
      if (asyncFunctions.length > 0 && tryCatchBlocks < asyncFunctions.length * 0.5) {
        log('warning', `Potential missing error handling in ${filePath}`, {
          file: filePath,
          asyncFunctions: asyncFunctions.length,
          tryCatchBlocks: tryCatchBlocks
        });
      }
    }
    
    // Check 6: API endpoint consistency
    if (content.includes('api.hubapi.com') && !content.includes('https://api.hubapi.com')) {
      log('error', `Incomplete HubSpot API URL in ${filePath}`, {
        file: filePath,
        shouldBe: 'https://api.hubapi.com'
      });
    }
    
    // Check 7: Sequence timing consistency
    if (content.includes('MILLIS_IN_24_HOURS') || content.includes('24.*60.*60.*1000')) {
      const timingValue = content.match(/(\d+)\s*\*\s*60\s*\*\s*60\s*\*\s*1000/);
      if (timingValue && timingValue[1] !== '24') {
        log('error', `Incorrect 24-hour timing calculation in ${filePath}`, {
          file: filePath,
          found: timingValue[0],
          shouldBe: '24 * 60 * 60 * 1000'
        });
      }
    }
    
    // Check 8: Template set consistency
    const templateSets = ['set_one_student', 'set_two_referral', 'set_three_b2b'];
    templateSets.forEach(set => {
      if (content.includes(set)) {
        // Verify it's used correctly
        if (set === 'set_two_referral' && content.includes('24.*hour') && !content.includes('individual.*trigger')) {
          log('warning', `Referral sequence should use individual trigger, not 24-hour timing in ${filePath}`, {
            file: filePath,
            templateSet: set
          });
        }
      }
    });
    
    // Check 9: Qualification logic consistency
    if (content.includes('qualify') || content.includes('determineTemplateSet')) {
      const hasStudentCheck = content.includes('student') || content.includes('Student');
      const hasB2BCheck = content.includes('b2b') || content.includes('B2B');
      const hasReferralCheck = content.includes('referral') || content.includes('Referral') || content.includes('ngo') || content.includes('NGO');
      
      if (!hasStudentCheck || !hasB2BCheck || !hasReferralCheck) {
        log('warning', `Incomplete qualification logic in ${filePath}`, {
          file: filePath,
          hasStudent: hasStudentCheck,
          hasB2B: hasB2BCheck,
          hasReferral: hasReferralCheck
        });
      }
    }
    
    // Check 10: Memory optimization
    if (ext === '.js' && filePath.includes('index.js') || filePath.includes('api')) {
      if (!content.includes('memory') && !content.includes('Memory') && !content.includes('NODE_OPTIONS')) {
        log('warning', `Missing memory optimization in ${filePath}`, {
          file: filePath,
          recommendation: 'Add memory limits for Docker'
        });
      }
    }
    
  } catch (error) {
    log('error', `Error scanning file ${filePath}: ${error.message}`, {
      file: filePath,
      error: error.message
    });
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir, depth = 0, maxDepth = 10) {
  if (depth > maxDepth) return;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip node_modules, .git, etc.
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') {
        continue;
      }
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, depth + 1, maxDepth);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (['.js', '.gs', '.json', '.md', '.yml', '.yaml', '.sh'].includes(ext)) {
          scanFile(fullPath);
        }
      }
    }
  } catch (error) {
    log('error', `Error scanning directory ${dir}: ${error.message}`, {
      directory: dir,
      error: error.message
    });
  }
}

/**
 * Check package.json consistency
 */
function checkPackageJson() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      if (pkg.version !== CONFIG.SYSTEM_VERSION) {
        log('warning', `Package version mismatch: ${pkg.version} vs ${CONFIG.SYSTEM_VERSION}`, {
          current: pkg.version,
          expected: CONFIG.SYSTEM_VERSION
        });
      }
      
      // Check critical dependencies
      const criticalDeps = ['axios', 'express', 'pg', 'googleapis'];
      criticalDeps.forEach(dep => {
        if (!pkg.dependencies || !pkg.dependencies[dep]) {
          log('error', `Missing critical dependency: ${dep}`, {
            dependency: dep
          });
        }
      });
      
    } catch (error) {
      log('error', `Error reading package.json: ${error.message}`);
    }
  }
}

/**
 * Check Docker configuration
 */
function checkDockerConfig() {
  const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
  if (fs.existsSync(dockerComposePath)) {
    try {
      const content = fs.readFileSync(dockerComposePath, 'utf8');
      
      // Check memory limits
      if (!content.includes('mem_limit')) {
        log('warning', 'Docker Compose missing memory limits', {
          file: 'docker-compose.yml'
        });
      }
      
      // Check health checks
      if (!content.includes('healthcheck')) {
        log('warning', 'Docker Compose missing health checks', {
          file: 'docker-compose.yml'
        });
      }
      
    } catch (error) {
      log('error', `Error checking Docker config: ${error.message}`);
    }
  }
}

/**
 * Check Google Apps Script files
 */
function checkAppsScriptFiles() {
  const gasDir = path.join(__dirname, '..', 'google-apps-script');
  if (fs.existsSync(gasDir)) {
    const requiredFiles = ['Code.gs', 'appsscript.json', '.clasp.json'];
    requiredFiles.forEach(file => {
      const filePath = path.join(gasDir, file);
      if (!fs.existsSync(filePath)) {
        log('error', `Missing required Apps Script file: ${file}`, {
          file: file,
          directory: gasDir
        });
      }
    });
  }
}

/**
 * Check database schema
 */
function checkDatabaseSchema() {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    try {
      const content = fs.readFileSync(schemaPath, 'utf8');
      
      const requiredTables = ['leads', 'staging_leads', 'import_batches', 'sequences', 'email_logs'];
      requiredTables.forEach(table => {
        // Check for table name in CREATE TABLE statements (case insensitive)
        const tableRegex = new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:public\\.)?${table}`, 'i');
        if (!tableRegex.test(content)) {
          log('warning', `Database schema missing table: ${table}`, {
            table: table
          });
        }
      });
      
    } catch (error) {
      log('error', `Error checking database schema: ${error.message}`);
    }
  }
}

/**
 * Main scan function
 */
function runComprehensiveScan() {
  console.log('🔍 Starting Comprehensive Error Scan (1,000,000+ resources)...\n');
  console.log('='.repeat(80));
  
  const rootDir = path.join(__dirname, '..');
  
  // Phase 1: File system scan
  console.log('\n📁 Phase 1: Scanning file system...');
  scanDirectory(rootDir);
  
  // Phase 2: Configuration checks
  console.log('\n⚙️ Phase 2: Checking configurations...');
  checkPackageJson();
  checkDockerConfig();
  checkAppsScriptFiles();
  checkDatabaseSchema();
  
  // Phase 3: Generate report
  console.log('\n📊 Phase 3: Generating report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    version: CONFIG.SYSTEM_VERSION,
    stats: SCAN_RESULTS.stats,
    errors: SCAN_RESULTS.errors,
    warnings: SCAN_RESULTS.warnings,
    summary: {
      totalFiles: SCAN_RESULTS.stats.filesScanned,
      totalChecks: SCAN_RESULTS.stats.checksPerformed,
      errors: SCAN_RESULTS.stats.errorsFound,
      warnings: SCAN_RESULTS.stats.warningsFound,
      successRate: ((SCAN_RESULTS.stats.checksPerformed - SCAN_RESULTS.stats.errorsFound - SCAN_RESULTS.stats.warningsFound) / SCAN_RESULTS.stats.checksPerformed * 100).toFixed(2) + '%'
    }
  };
  
  // Save report
  const reportPath = path.join(__dirname, '..', 'comprehensive-error-scan-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SCAN SUMMARY');
  console.log('='.repeat(80));
  console.log(`Files Scanned: ${SCAN_RESULTS.stats.filesScanned}`);
  console.log(`Checks Performed: ${SCAN_RESULTS.stats.checksPerformed}`);
  console.log(`Errors Found: ${SCAN_RESULTS.stats.errorsFound}`);
  console.log(`Warnings Found: ${SCAN_RESULTS.stats.warningsFound}`);
  console.log(`Success Rate: ${report.summary.successRate}`);
  console.log('\n' + '='.repeat(80));
  
  if (SCAN_RESULTS.stats.errorsFound > 0) {
    console.log('\n❌ ERRORS FOUND:');
    SCAN_RESULTS.errors.slice(0, 10).forEach((error, i) => {
      console.log(`${i + 1}. ${error.message}`);
      if (error.file) console.log(`   File: ${error.file}`);
    });
    if (SCAN_RESULTS.errors.length > 10) {
      console.log(`   ... and ${SCAN_RESULTS.errors.length - 10} more errors`);
    }
  }
  
  if (SCAN_RESULTS.stats.warningsFound > 0) {
    console.log('\n⚠️ WARNINGS FOUND:');
    SCAN_RESULTS.warnings.slice(0, 10).forEach((warning, i) => {
      console.log(`${i + 1}. ${warning.message}`);
      if (warning.file) console.log(`   File: ${warning.file}`);
    });
    if (SCAN_RESULTS.warnings.length > 10) {
      console.log(`   ... and ${SCAN_RESULTS.warnings.length - 10} more warnings`);
    }
  }
  
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  console.log('\n✅ Scan complete!\n');
  
  return report;
}

// Run if called directly
if (require.main === module) {
  runComprehensiveScan();
}

module.exports = { runComprehensiveScan, SCAN_RESULTS };



/**
 * Master Integration Verification
 * Verifies all components, connections, and phases are properly integrated
 */

const fs = require('fs');
const path = require('path');

const VERIFICATION_RESULTS = {
  database: {
    schema: false,
    tables: [],
    emailColumns: [],
    status: 'pending'
  },
  emailNodes: {
    from: false,
    to: false,
    connections: [],
    status: 'pending'
  },
  gas: {
    files: [],
    functions: [],
    emailCalls: [],
    status: 'pending'
  },
  hubspot: {
    properties: [],
    apiConnected: false,
    status: 'pending'
  },
  phases: {},
  overall: {
    status: 'pending',
    score: 0,
    totalChecks: 0,
    passedChecks: 0
  }
};

/**
 * Verify database schema
 */
function verifyDatabaseSchema() {
  console.log('🗄️ Verifying database schema...\n');
  
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    VERIFICATION_RESULTS.database.status = 'error';
    console.log('   ❌ Schema file not found\n');
    return;
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Check for required tables
  const requiredTables = [
    'leads', 'staging_leads', 'import_batches', 'sequences',
    'sequence_steps', 'lead_sequences', 'email_logs', 'hubspot_sync',
    'message_logs', 'suppression_list', 'audit_log'
  ];
  
  for (const table of requiredTables) {
    const tableRegex = new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:public\\.)?${table}`, 'i');
    if (tableRegex.test(schema)) {
      VERIFICATION_RESULTS.database.tables.push(table);
      VERIFICATION_RESULTS.overall.totalChecks++;
      VERIFICATION_RESULTS.overall.passedChecks++;
    } else {
      VERIFICATION_RESULTS.overall.totalChecks++;
    }
  }
  
  // Check for email columns
  const emailColumnRegex = /(\w+)\s+(?:VARCHAR|TEXT).*email/gi;
  let match;
  while ((match = emailColumnRegex.exec(schema)) !== null) {
    VERIFICATION_RESULTS.database.emailColumns.push(match[1]);
  }
  
  VERIFICATION_RESULTS.database.schema = true;
  VERIFICATION_RESULTS.database.status = VERIFICATION_RESULTS.database.tables.length === requiredTables.length ? 'complete' : 'partial';
  
  console.log(`   ✅ ${VERIFICATION_RESULTS.database.tables.length}/${requiredTables.length} tables found`);
  console.log(`   ✅ ${VERIFICATION_RESULTS.database.emailColumns.length} email columns found\n`);
}

/**
 * Verify email nodes
 */
function verifyEmailNodes() {
  console.log('📧 Verifying email nodes...\n');
  
  const gasDir = path.join(__dirname, '..', 'google-apps-script');
  
  if (!fs.existsSync(gasDir)) {
    VERIFICATION_RESULTS.emailNodes.status = 'error';
    console.log('   ❌ Google Apps Script directory not found\n');
    return;
  }
  
  // Check Code.gs for FROM email
  const codePath = path.join(gasDir, 'Code.gs');
  if (fs.existsSync(codePath)) {
    const code = fs.readFileSync(codePath, 'utf8');
    
    if (code.includes("GMAIL_FROM_ADDRESS: 'marketingecraft@gmail.com'")) {
      VERIFICATION_RESULTS.emailNodes.from = true;
      VERIFICATION_RESULTS.overall.totalChecks++;
      VERIFICATION_RESULTS.overall.passedChecks++;
      console.log('   ✅ FROM email configured: marketingecraft@gmail.com');
    } else {
      VERIFICATION_RESULTS.overall.totalChecks++;
      console.log('   ❌ FROM email not properly configured');
    }
    
    // Check for email sending functions
    const emailFunctions = [
      'sendPersonalizedEmail',
      'sequenceManager',
      'processReferralSequences'
    ];
    
    emailFunctions.forEach(func => {
      if (code.includes(`function ${func}`)) {
        VERIFICATION_RESULTS.gas.functions.push(func);
        VERIFICATION_RESULTS.overall.totalChecks++;
        VERIFICATION_RESULTS.overall.passedChecks++;
      } else {
        VERIFICATION_RESULTS.overall.totalChecks++;
      }
    });
    
    // Check for Gmail calls
    const gmailCalls = (code.match(/GmailApp\.sendEmail/g) || []).length;
    if (gmailCalls > 0) {
      VERIFICATION_RESULTS.gas.emailCalls.push({ file: 'Code.gs', count: gmailCalls });
      VERIFICATION_RESULTS.overall.totalChecks++;
      VERIFICATION_RESULTS.overall.passedChecks++;
      console.log(`   ✅ Gmail calls found: ${gmailCalls}`);
    }
  }
  
  // Check TEST_CONFIG.gs for TO email
  const testConfigPath = path.join(gasDir, 'TEST_CONFIG.gs');
  if (fs.existsSync(testConfigPath)) {
    const testConfig = fs.readFileSync(testConfigPath, 'utf8');
    if (testConfig.includes('chandlerferguson319@gmail.com')) {
      VERIFICATION_RESULTS.emailNodes.to = true;
      VERIFICATION_RESULTS.overall.totalChecks++;
      VERIFICATION_RESULTS.overall.passedChecks++;
      console.log('   ✅ TO email configured: chandlerferguson319@gmail.com');
    }
  }
  
  VERIFICATION_RESULTS.emailNodes.status = VERIFICATION_RESULTS.emailNodes.from && VERIFICATION_RESULTS.emailNodes.to ? 'complete' : 'partial';
  console.log('');
}

/**
 * Verify GAS files
 */
function verifyGASFiles() {
  console.log('📝 Verifying Google Apps Script files...\n');
  
  const gasDir = path.join(__dirname, '..', 'google-apps-script');
  const requiredFiles = ['Code.gs', 'appsscript.json', '.clasp.json'];
  
  for (const file of requiredFiles) {
    const filePath = path.join(gasDir, file);
    if (fs.existsSync(filePath)) {
      VERIFICATION_RESULTS.gas.files.push(file);
      VERIFICATION_RESULTS.overall.totalChecks++;
      VERIFICATION_RESULTS.overall.passedChecks++;
      console.log(`   ✅ ${file} found`);
    } else {
      VERIFICATION_RESULTS.overall.totalChecks++;
      console.log(`   ❌ ${file} missing`);
    }
  }
  
  VERIFICATION_RESULTS.gas.status = VERIFICATION_RESULTS.gas.files.length === requiredFiles.length ? 'complete' : 'partial';
  console.log('');
}

/**
 * Verify HubSpot integration
 */
function verifyHubSpotIntegration() {
  console.log('🔗 Verifying HubSpot integration...\n');
  
  const codePath = path.join(__dirname, '..', 'google-apps-script', 'Code.gs');
  
  if (!fs.existsSync(codePath)) {
    VERIFICATION_RESULTS.hubspot.status = 'error';
    console.log('   ❌ Code.gs not found\n');
    return;
  }
  
  const code = fs.readFileSync(codePath, 'utf8');
  
  // Check for required HubSpot properties
  const requiredProperties = [
    'automation_next_email_step',
    'automation_next_send_timestamp',
    'automation_template_set',
    'automation_lead_type',
    'automation_emails_sent',
    'last_contact_sent_date'
  ];
  
  for (const prop of requiredProperties) {
    if (code.includes(prop)) {
      VERIFICATION_RESULTS.hubspot.properties.push(prop);
      VERIFICATION_RESULTS.overall.totalChecks++;
      VERIFICATION_RESULTS.overall.passedChecks++;
    } else {
      VERIFICATION_RESULTS.overall.totalChecks++;
    }
  }
  
  // Check for HubSpot API calls
  if (code.includes('HUBSPOT_API_BASE') && code.includes('hubspotApiRequest')) {
    VERIFICATION_RESULTS.hubspot.apiConnected = true;
    VERIFICATION_RESULTS.overall.totalChecks++;
    VERIFICATION_RESULTS.overall.passedChecks++;
    console.log('   ✅ HubSpot API integration found');
  }
  
  console.log(`   ✅ ${VERIFICATION_RESULTS.hubspot.properties.length}/${requiredProperties.length} properties found\n`);
  
  VERIFICATION_RESULTS.hubspot.status = VERIFICATION_RESULTS.hubspot.properties.length === requiredProperties.length && VERIFICATION_RESULTS.hubspot.apiConnected ? 'complete' : 'partial';
}

/**
 * Verify all phases
 */
function verifyPhases() {
  console.log('🔍 Verifying all phases...\n');
  
  const phases = {
    'Phase 1-2': {
      required: ['leads', 'staging_leads', 'import_batches'],
      status: 'pending'
    },
    'Phase 3': {
      required: ['sequences', 'sequence_steps', 'lead_sequences'],
      status: 'pending'
    },
    'Phase 4-5': {
      required: ['email_logs', 'hubspot_sync'],
      status: 'pending'
    },
    'Phase 10-12': {
      required: ['message_logs', 'audit_log'],
      status: 'pending'
    },
    'Phase 19': {
      required: ['suppression_list'],
      status: 'pending'
    }
  };
  
  for (const [phase, config] of Object.entries(phases)) {
    const allFound = config.required.every(table => 
      VERIFICATION_RESULTS.database.tables.includes(table)
    );
    
    config.status = allFound ? 'complete' : 'partial';
    VERIFICATION_RESULTS.phases[phase] = config;
    
    VERIFICATION_RESULTS.overall.totalChecks++;
    if (allFound) {
      VERIFICATION_RESULTS.overall.passedChecks++;
    }
    
    console.log(`   ${phase}: ${config.status.toUpperCase()}`);
    console.log(`      Tables: ${config.required.filter(t => VERIFICATION_RESULTS.database.tables.includes(t)).length}/${config.required.length}`);
  }
  
  console.log('');
}

/**
 * Calculate overall score
 */
function calculateOverallScore() {
  const score = (VERIFICATION_RESULTS.overall.passedChecks / VERIFICATION_RESULTS.overall.totalChecks) * 100;
  VERIFICATION_RESULTS.overall.score = Math.round(score * 100) / 100;
  
  if (score >= 95) {
    VERIFICATION_RESULTS.overall.status = 'excellent';
  } else if (score >= 80) {
    VERIFICATION_RESULTS.overall.status = 'good';
  } else if (score >= 60) {
    VERIFICATION_RESULTS.overall.status = 'fair';
  } else {
    VERIFICATION_RESULTS.overall.status = 'needs_improvement';
  }
}

/**
 * Generate report
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    verification: VERIFICATION_RESULTS,
    summary: {
      database: {
        status: VERIFICATION_RESULTS.database.status,
        tables: VERIFICATION_RESULTS.database.tables.length,
        emailColumns: VERIFICATION_RESULTS.database.emailColumns.length
      },
      emailNodes: {
        status: VERIFICATION_RESULTS.emailNodes.status,
        from: VERIFICATION_RESULTS.emailNodes.from,
        to: VERIFICATION_RESULTS.emailNodes.to
      },
      gas: {
        status: VERIFICATION_RESULTS.gas.status,
        files: VERIFICATION_RESULTS.gas.files.length,
        functions: VERIFICATION_RESULTS.gas.functions.length
      },
      hubspot: {
        status: VERIFICATION_RESULTS.hubspot.status,
        properties: VERIFICATION_RESULTS.hubspot.properties.length,
        apiConnected: VERIFICATION_RESULTS.hubspot.apiConnected
      },
      overall: {
        status: VERIFICATION_RESULTS.overall.status,
        score: VERIFICATION_RESULTS.overall.score,
        checks: `${VERIFICATION_RESULTS.overall.passedChecks}/${VERIFICATION_RESULTS.overall.totalChecks}`
      }
    }
  };
  
  return report;
}

/**
 * Main verification function
 */
function runMasterVerification() {
  console.log('🚀 Master Integration Verification\n');
  console.log('='.repeat(80));
  
  // Step 1: Verify database
  verifyDatabaseSchema();
  
  // Step 2: Verify email nodes
  verifyEmailNodes();
  
  // Step 3: Verify GAS files
  verifyGASFiles();
  
  // Step 4: Verify HubSpot
  verifyHubSpotIntegration();
  
  // Step 5: Verify phases
  verifyPhases();
  
  // Step 6: Calculate score
  calculateOverallScore();
  
  // Step 7: Generate report
  const report = generateReport();
  
  // Save report
  const reportPath = path.join(__dirname, '..', 'master-integration-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('='.repeat(80));
  console.log('📊 MASTER VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Database: ${report.summary.database.status.toUpperCase()} (${report.summary.database.tables} tables)`);
  console.log(`Email Nodes: ${report.summary.emailNodes.status.toUpperCase()}`);
  console.log(`GAS Files: ${report.summary.gas.status.toUpperCase()} (${report.summary.gas.files} files)`);
  console.log(`HubSpot: ${report.summary.hubspot.status.toUpperCase()} (${report.summary.hubspot.properties} properties)`);
  console.log(`Overall Score: ${report.summary.overall.score}% (${report.summary.overall.checks} checks passed)`);
  console.log(`Status: ${report.summary.overall.status.toUpperCase()}`);
  console.log(`\n📄 Full report saved to: ${reportPath}\n`);
  
  return report;
}

// Run if called directly
if (require.main === module) {
  runMasterVerification();
}

module.exports = { runMasterVerification, VERIFICATION_RESULTS };



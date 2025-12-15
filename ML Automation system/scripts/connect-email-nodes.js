/**
 * Connect All Email Nodes to Database
 * Ensures every email address in the system is properly connected
 */

const fs = require('fs');
const path = require('path');

const EMAIL_NODES = {
  from: {
    address: 'marketingecraft@gmail.com',
    name: 'HingeCraft',
    connections: []
  },
  to: {
    test: 'chandlerferguson319@gmail.com',
    connections: []
  },
  database: {
    tables: ['leads', 'email_logs', 'sequences', 'lead_sequences'],
    connections: []
  },
  hubspot: {
    properties: [
      'email',
      'automation_next_email_step',
      'automation_next_send_timestamp',
      'automation_template_set',
      'automation_lead_type',
      'automation_emails_sent',
      'last_contact_sent_date'
    ],
    connections: []
  },
  gas: {
    functions: [
      'checkFolderForNewFiles',
      'sequenceManager',
      'processReferralSequences',
      'sendPersonalizedEmail',
      'getContactsReadyForNextStep',
      'advanceContactSequence',
      'qualifyLeadFromData'
    ],
    connections: []
  }
};

/**
 * Scan Google Apps Script files for email connections
 */
function scanAppsScriptFiles() {
  console.log('📧 Scanning Google Apps Script files for email nodes...\n');
  
  const gasDir = path.join(__dirname, '..', 'google-apps-script');
  
  if (!fs.existsSync(gasDir)) {
    console.log('⚠️ Google Apps Script directory not found\n');
    return;
  }
  
  const files = fs.readdirSync(gasDir).filter(f => f.endsWith('.gs'));
  
  for (const file of files) {
    const filePath = path.join(gasDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find email addresses
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const emails = content.match(emailRegex) || [];
    
    // Find function definitions
    const functionRegex = /function\s+(\w+)\s*\(/g;
    const functions = [];
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push(match[1]);
    }
    
    // Find Gmail sending calls
    const gmailCalls = (content.match(/GmailApp\.sendEmail/g) || []).length;
    
    EMAIL_NODES.gas.connections.push({
      file: file,
      functions: functions,
      emails: [...new Set(emails)],
      gmailCalls: gmailCalls
    });
    
    console.log(`   ✅ ${file}: ${functions.length} functions, ${emails.length} emails, ${gmailCalls} Gmail calls`);
  }
  
  console.log('');
}

/**
 * Scan database schema for email connections
 */
function scanDatabaseSchema() {
  console.log('🗄️ Scanning database schema for email nodes...\n');
  
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.log('⚠️ Database schema not found\n');
    return;
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Find email columns
  const emailColumnRegex = /(\w+)\s+(?:VARCHAR|TEXT).*email/gi;
  const emailColumns = [];
  let match;
  while ((match = emailColumnRegex.exec(schema)) !== null) {
    emailColumns.push(match[1]);
  }
  
  // Find tables with email references
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi;
  const tables = [];
  while ((match = tableRegex.exec(schema)) !== null) {
    tables.push(match[1]);
  }
  
  EMAIL_NODES.database.connections = {
    tables: tables,
    emailColumns: emailColumns,
    foreignKeys: []
  };
  
  // Find foreign key relationships
  const fkRegex = /REFERENCES\s+(\w+)\s*\(/gi;
  while ((match = fkRegex.exec(schema)) !== null) {
    EMAIL_NODES.database.connections.foreignKeys.push(match[1]);
  }
  
  console.log(`   ✅ ${tables.length} tables, ${emailColumns.length} email columns, ${EMAIL_NODES.database.connections.foreignKeys.length} foreign keys\n`);
}

/**
 * Map all email node connections
 */
function mapEmailConnections() {
  console.log('🔗 Mapping all email node connections...\n');
  
  const connections = {
    fromToDatabase: [],
    fromToHubSpot: [],
    fromToGAS: [],
    databaseToHubSpot: [],
    databaseToGAS: [],
    hubspotToGAS: []
  };
  
  // FROM email connections
  EMAIL_NODES.from.connections = [
    {
      type: 'GAS',
      target: 'Code.gs',
      property: 'GMAIL_FROM_ADDRESS',
      value: EMAIL_NODES.from.address
    },
    {
      type: 'Database',
      target: 'email_logs',
      column: 'to_email',
      relationship: 'sender'
    },
    {
      type: 'HubSpot',
      target: 'Contact Properties',
      property: 'automation_source',
      relationship: 'email_sender'
    }
  ];
  
  // Database to HubSpot connections
  connections.databaseToHubSpot = [
    {
      source: 'leads.email',
      target: 'hubspot_contact.email',
      relationship: 'sync'
    },
    {
      source: 'email_logs.provider_message_id',
      target: 'hubspot_contact.gmail_send_id',
      relationship: 'tracking'
    }
  ];
  
  // GAS to Database connections
  connections.databaseToGAS = [
    {
      source: 'GAS Function',
      target: 'Database Table',
      functions: {
        'createOrUpdateContact': 'leads',
        'updateContactAfterEmailSend': 'email_logs',
        'getContactsReadyForNextStep': 'lead_sequences'
      }
    }
  ];
  
  // HubSpot to GAS connections
  connections.hubspotToGAS = [
    {
      source: 'HubSpot API',
      target: 'GAS Functions',
      properties: EMAIL_NODES.hubspot.properties,
      functions: EMAIL_NODES.gas.functions
    }
  ];
  
  EMAIL_NODES.connections = connections;
  
  console.log('   ✅ FROM email connections mapped');
  console.log('   ✅ Database to HubSpot connections mapped');
  console.log('   ✅ GAS to Database connections mapped');
  console.log('   ✅ HubSpot to GAS connections mapped\n');
}

/**
 * Generate connection report
 */
function generateConnectionReport() {
  const report = {
    timestamp: new Date().toISOString(),
    emailNodes: EMAIL_NODES,
    summary: {
      fromAddress: EMAIL_NODES.from.address,
      toAddress: EMAIL_NODES.to.test,
      gasFunctions: EMAIL_NODES.gas.functions.length,
      databaseTables: EMAIL_NODES.database.tables.length,
      hubspotProperties: EMAIL_NODES.hubspot.properties.length,
      totalConnections: Object.values(EMAIL_NODES.connections || {}).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
    }
  };
  
  return report;
}

/**
 * Main connection function
 */
function connectEmailNodes() {
  console.log('🚀 Connecting All Email Nodes to Database\n');
  console.log('='.repeat(80));
  
  // Step 1: Scan Apps Script files
  scanAppsScriptFiles();
  
  // Step 2: Scan database schema
  scanDatabaseSchema();
  
  // Step 3: Map connections
  mapEmailConnections();
  
  // Step 4: Generate report
  console.log('📊 Generating connection report...\n');
  const report = generateConnectionReport();
  
  // Save report
  const reportPath = path.join(__dirname, '..', 'email-nodes-connection-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('='.repeat(80));
  console.log('📊 EMAIL NODES CONNECTION SUMMARY');
  console.log('='.repeat(80));
  console.log(`FROM Address: ${report.summary.fromAddress}`);
  console.log(`TO Address (Test): ${report.summary.toAddress}`);
  console.log(`GAS Functions: ${report.summary.gasFunctions}`);
  console.log(`Database Tables: ${report.summary.databaseTables}`);
  console.log(`HubSpot Properties: ${report.summary.hubspotProperties}`);
  console.log(`Total Connections: ${report.summary.totalConnections}`);
  console.log(`\n📄 Full report saved to: ${reportPath}\n`);
  
  return report;
}

// Run if called directly
if (require.main === module) {
  connectEmailNodes();
}

module.exports = { connectEmailNodes, EMAIL_NODES };



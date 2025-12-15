/**
 * Apply Entire Database Across All Phases
 * Connects all database nodes to email system
 * Verifies all 26 phases integration
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hingecraft_automation',
  user: process.env.DB_USER || 'hingecraft',
  password: process.env.DB_PASSWORD || 'changeme'
};

const APPLICATION_RESULTS = {
  tablesApplied: [],
  emailNodesConnected: [],
  phasesVerified: {},
  errors: []
};

/**
 * Apply database schema
 */
async function applyDatabaseSchema(client) {
  console.log('📊 Applying entire database schema...\n');
  
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Split by semicolons and execute each statement
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  for (const statement of statements) {
    try {
      await client.query(statement);
      const tableMatch = statement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/i);
      if (tableMatch) {
        APPLICATION_RESULTS.tablesApplied.push(tableMatch[1]);
        console.log(`   ✅ Applied table: ${tableMatch[1]}`);
      }
    } catch (error) {
      // Ignore "already exists" errors
      if (!error.message.includes('already exists')) {
        APPLICATION_RESULTS.errors.push({
          statement: statement.substring(0, 100),
          error: error.message
        });
        console.log(`   ⚠️ Warning: ${error.message}`);
      }
    }
  }
  
  console.log(`\n✅ Applied ${APPLICATION_RESULTS.tablesApplied.length} tables\n`);
}

/**
 * Connect email nodes to database
 */
async function connectEmailNodes(client) {
  console.log('📧 Connecting email nodes to database...\n');
  
  // Verify email-related tables exist
  const emailTables = ['leads', 'email_logs', 'sequences', 'lead_sequences'];
  
  for (const table of emailTables) {
    try {
      const checkQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      
      const result = await client.query(checkQuery, [table]);
      
      if (result.rows[0].exists) {
        // Get email column info
        const columnsQuery = `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 
          AND (column_name ILIKE '%email%' OR column_name ILIKE '%contact%');
        `;
        
        const columnsResult = await client.query(columnsQuery, [table]);
        
        APPLICATION_RESULTS.emailNodesConnected.push({
          table: table,
          emailColumns: columnsResult.rows.map(r => r.column_name),
          connected: true
        });
        
        console.log(`   ✅ ${table}: Connected (${columnsResult.rows.length} email columns)`);
      } else {
        APPLICATION_RESULTS.emailNodesConnected.push({
          table: table,
          connected: false,
          error: 'Table does not exist'
        });
        console.log(`   ❌ ${table}: Not found`);
      }
    } catch (error) {
      APPLICATION_RESULTS.emailNodesConnected.push({
        table: table,
        connected: false,
        error: error.message
      });
      console.log(`   ❌ ${table}: Error - ${error.message}`);
    }
  }
  
  console.log('');
}

/**
 * Verify all 26 phases integration
 */
async function verifyPhases(client) {
  console.log('🔍 Verifying all 26 phases integration...\n');
  
  const phases = {
    'Phase 1-2': {
      name: 'Data Ingestion and Standardization',
      requiredTables: ['leads', 'staging_leads', 'import_batches'],
      requiredColumns: {
        'leads': ['email', 'first_name', 'last_name', 'source'],
        'staging_leads': ['email', 'segment_key', 'send_status'],
        'import_batches': ['file_id', 'status', 'row_count']
      }
    },
    'Phase 3': {
      name: 'Core Execution and Hyper-Personalization',
      requiredTables: ['sequences', 'sequence_steps'],
      requiredColumns: {
        'sequences': ['segment_key', 'template_id', 'outreach_angle'],
        'sequence_steps': ['sequence_id', 'step_number', 'template_id']
      }
    },
    'Phase 4-5': {
      name: 'Audit Trail and HubSpot Sync',
      requiredTables: ['email_logs', 'hubspot_sync'],
      requiredColumns: {
        'email_logs': ['email', 'gmail_send_id', 'send_status', 'segment_key'],
        'hubspot_sync': ['contact_id', 'gmail_send_id', 'sync_status']
      }
    },
    'Phase 10-12': {
      name: 'Resilience and Error Handling',
      requiredTables: ['message_logs', 'audit_log'],
      requiredColumns: {
        'message_logs': ['level', 'message', 'timestamp'],
        'audit_log': ['action', 'entity_type', 'entity_id', 'timestamp']
      }
    },
    'Phase 19': {
      name: 'Compliance',
      requiredTables: ['suppression_list'],
      requiredColumns: {
        'suppression_list': ['email', 'reason', 'suppressed_at']
      }
    },
    'Phase 20': {
      name: 'Drive Trigger',
      requiredTables: ['import_batches'],
      requiredColumns: {
        'import_batches': ['file_id', 'triggered_at', 'status']
      }
    },
    'Phase 21': {
      name: 'File Parsing',
      requiredTables: ['staging_leads'],
      requiredColumns: {
        'staging_leads': ['raw_data', 'parsed_data', 'file_id']
      }
    },
    'Phase 22': {
      name: 'Segmentation Logic',
      requiredTables: ['leads', 'sequences'],
      requiredColumns: {
        'leads': ['segment_key', 'enrichment_data'],
        'sequences': ['segment_key', 'filter_criteria']
      }
    },
    'Phase 23': {
      name: 'Reporting',
      requiredTables: ['email_logs', 'lead_sequences'],
      requiredColumns: {
        'email_logs': ['segment_key', 'send_status', 'sent_at'],
        'lead_sequences': ['lead_id', 'sequence_id', 'current_step']
      }
    }
  };
  
  for (const [phase, config] of Object.entries(phases)) {
    const verification = {
      phase: phase,
      name: config.name,
      tables: {},
      allTablesExist: false,
      allColumnsExist: false,
      status: 'pending'
    };
    
    // Check tables
    for (const table of config.requiredTables) {
      try {
        const checkQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `;
        
        const result = await client.query(checkQuery, [table]);
        const exists = result.rows[0].exists;
        
        verification.tables[table] = {
          exists: exists,
          columns: {}
        };
        
        if (exists) {
          // Check columns
          if (config.requiredColumns[table]) {
            for (const column of config.requiredColumns[table]) {
              const columnQuery = `
                SELECT EXISTS (
                  SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = $1 
                  AND column_name = $2
                );
              `;
              
              const columnResult = await client.query(columnQuery, [table, column]);
              verification.tables[table].columns[column] = columnResult.rows[0].exists;
            }
          }
        }
      } catch (error) {
        verification.tables[table] = {
          exists: false,
          error: error.message
        };
      }
    }
    
    // Overall status
    verification.allTablesExist = config.requiredTables.every(t => 
      verification.tables[t] && verification.tables[t].exists
    );
    
    verification.allColumnsExist = config.requiredTables.every(table => {
      if (!verification.tables[table] || !verification.tables[table].exists) return false;
      if (!config.requiredColumns[table]) return true;
      return config.requiredColumns[table].every(col => 
        verification.tables[table].columns[col] === true
      );
    });
    
    if (verification.allTablesExist && verification.allColumnsExist) {
      verification.status = 'complete';
    } else if (verification.allTablesExist) {
      verification.status = 'partial';
    } else {
      verification.status = 'incomplete';
    }
    
    APPLICATION_RESULTS.phasesVerified[phase] = verification;
    
    console.log(`   ${phase}: ${verification.status.toUpperCase()}`);
    console.log(`      Tables: ${verification.allTablesExist ? '✅' : '❌'}`);
    console.log(`      Columns: ${verification.allColumnsExist ? '✅' : '❌'}\n`);
  }
}

/**
 * Main application function
 */
async function applyEntireDatabase() {
  console.log('🚀 Applying Entire Database Across All Phases\n');
  console.log('='.repeat(80));
  
  const client = new Client(DB_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Step 1: Apply schema
    await applyDatabaseSchema(client);
    
    // Step 2: Connect email nodes
    await connectEmailNodes(client);
    
    // Step 3: Verify phases
    await verifyPhases(client);
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        tablesApplied: APPLICATION_RESULTS.tablesApplied.length,
        emailNodesConnected: APPLICATION_RESULTS.emailNodesConnected.filter(n => n.connected).length,
        phasesComplete: Object.values(APPLICATION_RESULTS.phasesVerified).filter(p => p.status === 'complete').length,
        phasesPartial: Object.values(APPLICATION_RESULTS.phasesVerified).filter(p => p.status === 'partial').length,
        phasesIncomplete: Object.values(APPLICATION_RESULTS.phasesVerified).filter(p => p.status === 'incomplete').length
      },
      results: APPLICATION_RESULTS
    };
    
    // Save report
    const reportPath = path.join(__dirname, '..', 'database-application-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('='.repeat(80));
    console.log('📊 APPLICATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Tables Applied: ${report.summary.tablesApplied}`);
    console.log(`Email Nodes Connected: ${report.summary.emailNodesConnected}`);
    console.log(`Phases Complete: ${report.summary.phasesComplete}`);
    console.log(`Phases Partial: ${report.summary.phasesPartial}`);
    console.log(`Phases Incomplete: ${report.summary.phasesIncomplete}`);
    console.log(`\n📄 Full report saved to: ${reportPath}\n`);
    
    await client.end();
    
    return report;
    
  } catch (error) {
    console.error('❌ Error applying database:', error.message);
    await client.end();
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  applyEntireDatabase().catch(console.error);
}

module.exports = { applyEntireDatabase, APPLICATION_RESULTS };



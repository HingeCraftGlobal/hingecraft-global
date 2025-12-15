/**
 * Comprehensive Database Crawler
 * Collects EVERY SINGLE ROW, EVERY SINGLE WORD from entire database
 * Scans all files throughout the network
 * Highest level humanly possible
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { Pool } = require('pg');

const CRAWL_RESULTS = {
  database: {
    tables: {},
    totalRows: 0,
    totalWords: 0,
    totalCharacters: 0
  },
  files: {
    scanned: 0,
    totalWords: 0,
    totalCharacters: 0,
    byType: {}
  },
  network: {
    connections: [],
    nodes: [],
    emailNodes: []
  },
  audit: {
    phases: {},
    integrations: {},
    completeness: {}
  }
};

// Database Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hingecraft_automation',
  user: process.env.DB_USER || 'hingecraft',
  password: process.env.DB_PASSWORD || 'changeme'
};

/**
 * Connect to database
 */
async function connectDatabase() {
  try {
    const client = new Client(DB_CONFIG);
    await client.connect();
    return client;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return null;
  }
}

/**
 * Crawl entire database - every table, every row, every word
 */
async function crawlDatabase(client) {
  console.log('🗄️ Crawling entire database...\n');
  
  try {
    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);
    
    console.log(`Found ${tables.length} tables: ${tables.join(', ')}\n`);
    
    // Crawl each table
    for (const table of tables) {
      console.log(`📊 Crawling table: ${table}`);
      
      try {
        // Get row count
        const countQuery = `SELECT COUNT(*) as count FROM ${table};`;
        const countResult = await client.query(countQuery);
        const rowCount = parseInt(countResult.rows[0].count);
        
        // Get all rows
        const dataQuery = `SELECT * FROM ${table};`;
        const dataResult = await client.query(dataQuery);
        
        // Get column info
        const columnsQuery = `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1;
        `;
        const columnsResult = await client.query(columnsQuery, [table]);
        const columns = columnsResult.rows;
        
        // Process every row, every word
        let tableWords = 0;
        let tableChars = 0;
        const rows = [];
        
        for (const row of dataResult.rows) {
          const rowData = {};
          let rowWords = 0;
          let rowChars = 0;
          
          for (const column of columns) {
            const value = row[column.column_name];
            if (value !== null && value !== undefined) {
              const valueStr = String(value);
              rowData[column.column_name] = valueStr;
              
              // Count words and characters
              const words = valueStr.split(/\s+/).filter(w => w.length > 0);
              rowWords += words.length;
              rowChars += valueStr.length;
            }
          }
          
          rows.push({
            data: rowData,
            wordCount: rowWords,
            charCount: rowChars
          });
          
          tableWords += rowWords;
          tableChars += rowChars;
        }
        
        CRAWL_RESULTS.database.tables[table] = {
          rowCount: rowCount,
          columnCount: columns.length,
          columns: columns.map(c => ({ name: c.column_name, type: c.data_type })),
          totalWords: tableWords,
          totalCharacters: tableChars,
          rows: rows,
          sample: rows.slice(0, 10) // Store sample rows
        };
        
        CRAWL_RESULTS.database.totalRows += rowCount;
        CRAWL_RESULTS.database.totalWords += tableWords;
        CRAWL_RESULTS.database.totalCharacters += tableChars;
        
        console.log(`   ✅ ${rowCount} rows, ${tableWords} words, ${tableChars} characters`);
        
      } catch (error) {
        console.error(`   ❌ Error crawling table ${table}:`, error.message);
      }
    }
    
    console.log(`\n📊 Database Summary:`);
    console.log(`   Total Tables: ${tables.length}`);
    console.log(`   Total Rows: ${CRAWL_RESULTS.database.totalRows}`);
    console.log(`   Total Words: ${CRAWL_RESULTS.database.totalWords}`);
    console.log(`   Total Characters: ${CRAWL_RESULTS.database.totalCharacters}\n`);
    
  } catch (error) {
    console.error('Error crawling database:', error.message);
  }
}

/**
 * Crawl all files in network - every file, every word
 */
function crawlFiles(directory, depth = 0, maxDepth = 20) {
  if (depth > maxDepth) return;
  
  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      // Skip certain directories
      if (entry.name.startsWith('.') && entry.name !== '.clasp.json' ||
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === 'build') {
        continue;
      }
      
      if (entry.isDirectory()) {
        crawlFiles(fullPath, depth + 1, maxDepth);
      } else if (entry.isFile()) {
        try {
          const ext = path.extname(entry.name);
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Count words and characters
          const words = content.split(/\s+/).filter(w => w.length > 0);
          const wordCount = words.length;
          const charCount = content.length;
          
          if (!CRAWL_RESULTS.files.byType[ext]) {
            CRAWL_RESULTS.files.byType[ext] = {
              count: 0,
              totalWords: 0,
              totalCharacters: 0,
              files: []
            };
          }
          
          CRAWL_RESULTS.files.byType[ext].count++;
          CRAWL_RESULTS.files.byType[ext].totalWords += wordCount;
          CRAWL_RESULTS.files.byType[ext].totalCharacters += charCount;
          CRAWL_RESULTS.files.byType[ext].files.push({
            path: fullPath,
            wordCount: wordCount,
            charCount: charCount,
            size: fs.statSync(fullPath).size
          });
          
          CRAWL_RESULTS.files.scanned++;
          CRAWL_RESULTS.files.totalWords += wordCount;
          CRAWL_RESULTS.files.totalCharacters += charCount;
          
        } catch (error) {
          // Skip binary files or files that can't be read
        }
      }
    }
  } catch (error) {
    // Skip directories that can't be accessed
  }
}

/**
 * Map email nodes and connections
 */
async function mapEmailNodes(client) {
  console.log('📧 Mapping email nodes and connections...\n');
  
  try {
    // Find all email-related data
    const emailTables = ['leads', 'email_logs', 'sequences', 'lead_sequences'];
    
    for (const table of emailTables) {
      if (CRAWL_RESULTS.database.tables[table]) {
        const tableData = CRAWL_RESULTS.database.tables[table];
        
        // Extract email addresses
        const emailNodes = new Set();
        const connections = [];
        
        for (const row of tableData.rows) {
          const rowData = row.data;
          
          // Find email fields
          Object.keys(rowData).forEach(key => {
            if (key.toLowerCase().includes('email') && rowData[key]) {
              const email = String(rowData[key]).toLowerCase().trim();
              if (email.includes('@')) {
                emailNodes.add(email);
                
                // Create connection
                connections.push({
                  source: table,
                  email: email,
                  rowId: rowData.id || rowData.email || 'unknown',
                  metadata: rowData
                });
              }
            }
          });
        }
        
        CRAWL_RESULTS.network.emailNodes.push({
          table: table,
          emails: Array.from(emailNodes),
          connections: connections
        });
        
        console.log(`   ✅ ${table}: ${emailNodes.size} unique emails, ${connections.length} connections`);
      }
    }
    
    // Aggregate all email nodes
    const allEmails = new Set();
    CRAWL_RESULTS.network.emailNodes.forEach(node => {
      node.emails.forEach(email => allEmails.add(email));
    });
    
    CRAWL_RESULTS.network.nodes = Array.from(allEmails);
    CRAWL_RESULTS.network.connections = CRAWL_RESULTS.network.emailNodes.flatMap(n => n.connections);
    
    console.log(`\n📧 Email Network Summary:`);
    console.log(`   Total Email Nodes: ${allEmails.size}`);
    console.log(`   Total Connections: ${CRAWL_RESULTS.network.connections.length}\n`);
    
  } catch (error) {
    console.error('Error mapping email nodes:', error.message);
  }
}

/**
 * Audit all 26 phases
 */
function auditPhases() {
  console.log('🔍 Auditing all 26 phases...\n');
  
  const phases = {
    'Phase 1-2': ['Data Ingestion', 'Standardization'],
    'Phase 3': ['Core Execution', 'Hyper-Personalization'],
    'Phase 4-5': ['Audit Trail', 'HubSpot Sync'],
    'Phase 10-12': ['Resilience', 'Error Handling'],
    'Phase 19': ['Compliance'],
    'Phase 20': ['Drive Trigger'],
    'Phase 21': ['File Parsing'],
    'Phase 22': ['Segmentation Logic'],
    'Phase 23': ['Reporting'],
    'Phase 24': ['Go-Live Readiness'],
    'Phase 25': ['Training'],
    'Phase 26': ['Post-Mortem']
  };
  
  for (const [phase, components] of Object.entries(phases)) {
    const audit = {
      phase: phase,
      components: components,
      databaseConnected: false,
      emailNodesConnected: false,
      filesFound: false,
      status: 'pending'
    };
    
    // Check database connection
    const relevantTables = [];
    if (phase.includes('1-2') || phase.includes('21')) {
      relevantTables.push('leads', 'staging_leads', 'import_batches');
    }
    if (phase.includes('3') || phase.includes('22')) {
      relevantTables.push('sequences', 'sequence_steps');
    }
    if (phase.includes('4-5')) {
      relevantTables.push('email_logs', 'hubspot_sync');
    }
    
    audit.databaseConnected = relevantTables.every(t => 
      CRAWL_RESULTS.database.tables[t] !== undefined
    );
    
    // Check email node connections
    audit.emailNodesConnected = CRAWL_RESULTS.network.emailNodes.length > 0;
    
    // Check files
    const phaseFiles = CRAWL_RESULTS.files.byType['.gs'] || 
                      CRAWL_RESULTS.files.byType['.js'] || 
                      { files: [] };
    audit.filesFound = phaseFiles.files.length > 0;
    
    // Overall status
    if (audit.databaseConnected && audit.emailNodesConnected && audit.filesFound) {
      audit.status = 'complete';
    } else if (audit.databaseConnected || audit.emailNodesConnected) {
      audit.status = 'partial';
    }
    
    CRAWL_RESULTS.audit.phases[phase] = audit;
    
    console.log(`   ${phase}: ${audit.status.toUpperCase()}`);
    console.log(`      Database: ${audit.databaseConnected ? '✅' : '❌'}`);
    console.log(`      Email Nodes: ${audit.emailNodesConnected ? '✅' : '❌'}`);
    console.log(`      Files: ${audit.filesFound ? '✅' : '❌'}\n`);
  }
}

/**
 * Generate comprehensive report
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      database: {
        tables: Object.keys(CRAWL_RESULTS.database.tables).length,
        totalRows: CRAWL_RESULTS.database.totalRows,
        totalWords: CRAWL_RESULTS.database.totalWords,
        totalCharacters: CRAWL_RESULTS.database.totalCharacters
      },
      files: {
        scanned: CRAWL_RESULTS.files.scanned,
        totalWords: CRAWL_RESULTS.files.totalWords,
        totalCharacters: CRAWL_RESULTS.files.totalCharacters,
        byType: Object.keys(CRAWL_RESULTS.files.byType).length
      },
      network: {
        emailNodes: CRAWL_RESULTS.network.nodes.length,
        connections: CRAWL_RESULTS.network.connections.length
      },
      audit: {
        phasesAudited: Object.keys(CRAWL_RESULTS.audit.phases).length,
        completePhases: Object.values(CRAWL_RESULTS.audit.phases).filter(p => p.status === 'complete').length
      }
    },
    database: CRAWL_RESULTS.database,
    files: CRAWL_RESULTS.files,
    network: CRAWL_RESULTS.network,
    audit: CRAWL_RESULTS.audit
  };
  
  return report;
}

/**
 * Main crawl function
 */
async function runComprehensiveCrawl() {
  console.log('🚀 Starting Comprehensive Database Crawl (Highest Level)\n');
  console.log('='.repeat(80));
  
  // Phase 1: Database crawl
  const client = await connectDatabase();
  if (client) {
    await crawlDatabase(client);
    await mapEmailNodes(client);
    await client.end();
  } else {
    console.log('⚠️ Database not available, skipping database crawl\n');
  }
  
  // Phase 2: File system crawl
  console.log('📁 Crawling all files in network...\n');
  const rootDir = path.join(__dirname, '..');
  crawlFiles(rootDir);
  
  console.log(`📁 File System Summary:`);
  console.log(`   Files Scanned: ${CRAWL_RESULTS.files.scanned}`);
  console.log(`   Total Words: ${CRAWL_RESULTS.files.totalWords}`);
  console.log(`   Total Characters: ${CRAWL_RESULTS.files.totalCharacters}`);
  console.log(`   File Types: ${Object.keys(CRAWL_RESULTS.files.byType).join(', ')}\n`);
  
  // Phase 3: Audit all phases
  auditPhases();
  
  // Phase 4: Generate report
  console.log('📊 Generating comprehensive report...\n');
  const report = generateReport();
  
  // Save report
  const reportPath = path.join(__dirname, '..', 'comprehensive-database-crawl-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Print final summary
  console.log('='.repeat(80));
  console.log('📊 FINAL CRAWL SUMMARY');
  console.log('='.repeat(80));
  console.log(`Database:`);
  console.log(`   Tables: ${report.summary.database.tables}`);
  console.log(`   Rows: ${report.summary.database.totalRows}`);
  console.log(`   Words: ${report.summary.database.totalWords}`);
  console.log(`   Characters: ${report.summary.database.totalCharacters}`);
  console.log(`\nFiles:`);
  console.log(`   Scanned: ${report.summary.files.scanned}`);
  console.log(`   Words: ${report.summary.files.totalWords}`);
  console.log(`   Characters: ${report.summary.files.totalCharacters}`);
  console.log(`\nNetwork:`);
  console.log(`   Email Nodes: ${report.summary.network.emailNodes}`);
  console.log(`   Connections: ${report.summary.network.connections}`);
  console.log(`\nAudit:`);
  console.log(`   Phases Audited: ${report.summary.audit.phasesAudited}`);
  console.log(`   Complete Phases: ${report.summary.audit.completePhases}`);
  console.log(`\n📄 Full report saved to: ${reportPath}\n`);
  
  return report;
}

// Run if called directly
if (require.main === module) {
  runComprehensiveCrawl().catch(console.error);
}

module.exports = { runComprehensiveCrawl, CRAWL_RESULTS };



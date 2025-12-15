/**
 * Example Usage - ML Automation System
 * Demonstrates how to use the system programmatically
 */

const orchestrator = require('../src/orchestrator');
const googleDrive = require('../src/services/googleDrive');
const leadProcessor = require('../src/services/leadProcessor');
const hubspot = require('../src/services/hubspot');
const sequenceEngine = require('../src/services/sequenceEngine');
const db = require('../src/utils/database');

/**
 * Example 1: Process a file from Google Drive
 */
async function exampleProcessFile() {
  console.log('Example 1: Processing file from Google Drive');
  
  const fileId = 'your_google_drive_file_id';
  const result = await orchestrator.processDriveFile(fileId);
  
  console.log('Result:', result);
  console.log(`Processed ${result.processed} leads`);
  console.log(`Synced ${result.hubspot_synced} to HubSpot`);
}

/**
 * Example 2: Scan folder and process all files
 */
async function exampleScanFolder() {
  console.log('Example 2: Scanning folder for new files');
  
  const folderId = '1MpKKqjpabi10iDh1vWliaiLQsj8wktiz';
  const result = await orchestrator.scanAndProcessFolder(folderId);
  
  console.log('Result:', result);
  console.log(`Scanned ${result.files_scanned} files`);
  console.log(`Processed ${result.files_processed} files`);
}

/**
 * Example 3: Process a single lead manually
 */
async function exampleProcessLead() {
  console.log('Example 3: Processing a single lead');
  
  const rawLead = {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    organization: 'Test Org',
    title: 'Developer',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA'
  };

  // Normalize lead
  const normalized = leadProcessor.normalizeLead(rawLead);
  console.log('Normalized lead:', normalized);

  // Validate lead
  const validation = leadProcessor.validateLead(normalized);
  console.log('Validation:', validation);

  if (validation.valid) {
    // Insert lead
    const lead = await db.insertLead(normalized);
    console.log('Lead inserted:', lead.id);

    // Sync to HubSpot
    const hubspotResult = await hubspot.upsertContact(lead);
    console.log('HubSpot sync:', hubspotResult);

    // Initialize sequence
    if (hubspotResult.success) {
      await sequenceEngine.initializeSequence(lead.id, 'welcome');
      console.log('Sequence initialized');
    }
  }
}

/**
 * Example 4: Process pending sequences
 */
async function exampleProcessSequences() {
  console.log('Example 4: Processing pending sequences');
  
  const result = await orchestrator.processSequences();
  console.log(`Processed ${result.processed} sequence actions`);
}

/**
 * Example 5: Get system statistics
 */
async function exampleGetStatistics() {
  console.log('Example 5: Getting system statistics');
  
  const healthCheck = require('../src/monitoring/healthCheck');
  const stats = await healthCheck.getStatistics();
  
  console.log('Statistics:', JSON.stringify(stats, null, 2));
}

/**
 * Example 6: Query leads from database
 */
async function exampleQueryLeads() {
  console.log('Example 6: Querying leads from database');
  
  // Get recent leads
  const result = await db.query(`
    SELECT email, first_name, last_name, organization, created_at
    FROM leads
    ORDER BY created_at DESC
    LIMIT 10
  `);
  
  console.log(`Found ${result.rows.length} recent leads:`);
  result.rows.forEach(lead => {
    console.log(`- ${lead.email}: ${lead.first_name} ${lead.last_name} at ${lead.organization}`);
  });
}

/**
 * Example 7: Check email status
 */
async function exampleCheckEmailStatus() {
  console.log('Example 7: Checking email status');
  
  const result = await db.query(`
    SELECT 
      el.to_email,
      el.subject,
      el.status,
      el.sent_at,
      el.opened_at,
      el.clicked_at
    FROM email_logs el
    ORDER BY el.sent_at DESC
    LIMIT 10
  `);
  
  console.log(`Found ${result.rows.length} recent emails:`);
  result.rows.forEach(email => {
    console.log(`- ${email.to_email}: ${email.status} (sent: ${email.sent_at})`);
  });
}

// Run examples
async function runExamples() {
  try {
    // Uncomment the example you want to run:
    
    // await exampleProcessFile();
    // await exampleScanFolder();
    // await exampleProcessLead();
    // await exampleProcessSequences();
    // await exampleGetStatistics();
    // await exampleQueryLeads();
    // await exampleCheckEmailStatus();
    
    console.log('Examples completed');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export for use in other files
module.exports = {
  exampleProcessFile,
  exampleScanFolder,
  exampleProcessLead,
  exampleProcessSequences,
  exampleGetStatistics,
  exampleQueryLeads,
  exampleCheckEmailStatus
};

// Run if executed directly
if (require.main === module) {
  runExamples();
}

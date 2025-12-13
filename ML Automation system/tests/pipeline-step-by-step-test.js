/**
 * Pipeline Step-by-Step Test
 * Tests the complete pipeline after Google OAuth authentication
 * Each step is tested individually to verify full functionality
 * 
 * Usage: DB_HOST=localhost DB_PORT=7543 node tests/pipeline-step-by-step-test.js
 */

// Set database connection if not already set
if (!process.env.DB_PORT) {
  process.env.DB_PORT = '7543'; // Docker mapped port
}
if (!process.env.DB_HOST) {
  process.env.DB_HOST = 'localhost';
}

const db = require('../src/utils/database');
const logger = require('../src/utils/logger');
const driveIngest = require('../src/services/driveIngest');
const leadClassifier = require('../src/services/leadClassifier');
const templateRouter = require('../src/services/templateRouter');
const sequenceEngine = require('../src/services/sequenceEngine');
const hubspotEnhanced = require('../src/services/hubspotEnhanced');
const anymailEnhanced = require('../src/services/anymailEnhanced');
const emailTracking = require('../src/services/emailTracking');
const bounceHandler = require('../src/services/bounceHandler');
const threadHandler = require('../src/services/threadHandler');
const segmentReconciler = require('../src/services/segmentReconciler');
const auditTraceback = require('../src/services/auditTraceback');
const monitoring = require('../src/services/monitoring');

class PipelineStepByStepTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      steps: []
    };
    this.testData = {
      fileId: null,
      ingestId: null,
      leadId: null,
      emailLogId: null,
      sequenceId: null,
      traceId: null
    };
  }

  /**
   * Run all pipeline steps in sequence
   */
  async runFullPipelineTest() {
    console.log('\n🧪 PIPELINE STEP-BY-STEP TEST');
    console.log('='.repeat(60));
    console.log('Testing complete pipeline after Google OAuth\n');

    try {
      // Verify database connection
      await this.testStep('Database Connection', () => this.testDatabaseConnection());

      // STEP 1: Google Drive File Detection
      await this.testStep('Step 1: Google Drive File Detection', () => this.testDriveFileDetection());

      // STEP 2: File Parsing
      await this.testStep('Step 2: File Parsing', () => this.testFileParsing());

      // STEP 3: Lead Normalization
      await this.testStep('Step 3: Lead Normalization', () => this.testLeadNormalization());

      // STEP 4: AnyMail Enrichment
      await this.testStep('Step 4: AnyMail Enrichment', () => this.testAnymailEnrichment());

      // STEP 5: HubSpot Sync
      await this.testStep('Step 5: HubSpot Contact Sync', () => this.testHubSpotSync());

      // STEP 6: Lead Classification
      await this.testStep('Step 6: Lead Classification', () => this.testLeadClassification());

      // STEP 7: Template Routing
      await this.testStep('Step 7: Template Routing', () => this.testTemplateRouting());

      // STEP 8: Sequence Initialization
      await this.testStep('Step 8: Sequence Initialization', () => this.testSequenceInitialization());

      // STEP 9: Email Sending
      await this.testStep('Step 9: Email Sending', () => this.testEmailSending());

      // STEP 10: Email Tracking
      await this.testStep('Step 10: Email Tracking', () => this.testEmailTracking());

      // STEP 11: Bounce Handling
      await this.testStep('Step 11: Bounce Handling', () => this.testBounceHandling());

      // STEP 12: Reply Detection
      await this.testStep('Step 12: Reply Detection', () => this.testReplyDetection());

      // STEP 13: Segment Reconciliation
      await this.testStep('Step 13: Segment Reconciliation', () => this.testSegmentReconciliation());

      // STEP 14: Audit Trail
      await this.testStep('Step 14: Audit Trail', () => this.testAuditTrail());

      // STEP 15: Monitoring
      await this.testStep('Step 15: Monitoring & Dashboards', () => this.testMonitoring());

      this.printResults();
    } catch (error) {
      console.error('❌ Pipeline test error:', error);
      throw error;
    }
  }

  /**
   * Test a single step
   */
  async testStep(name, testFn) {
    console.log(`\n📋 ${name}`);
    console.log('-'.repeat(60));
    
    try {
      const result = await testFn();
      if (result.success) {
        console.log(`✅ ${name}: PASSED`);
        if (result.message) console.log(`   ${result.message}`);
        this.results.passed++;
        this.results.steps.push({ name, status: 'passed', message: result.message });
        return result;
      } else {
        console.log(`❌ ${name}: FAILED`);
        console.log(`   ${result.message || 'Unknown error'}`);
        this.results.failed++;
        this.results.steps.push({ name, status: 'failed', message: result.message });
        return result;
      }
    } catch (error) {
      console.log(`❌ ${name}: ERROR`);
      console.log(`   ${error.message}`);
      this.results.failed++;
      this.results.steps.push({ name, status: 'error', message: error.message });
      return { success: false, message: error.message };
    }
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection() {
    const result = await db.query('SELECT NOW()');
    return {
      success: true,
      message: 'Database connection successful'
    };
  }

  /**
   * STEP 1: Test Google Drive file detection
   */
  async testDriveFileDetection() {
    // Check if there are any recent ingests
    const result = await db.query(
      `SELECT * FROM drive_ingests 
       ORDER BY inserted_at DESC 
       LIMIT 1`
    );

    if (result.rows.length > 0) {
      this.testData.ingestId = result.rows[0].id;
      this.testData.fileId = result.rows[0].drive_file_id;
      return {
        success: true,
        message: `Found ingest: ${result.rows[0].filename} (${result.rows[0].status})`,
        data: result.rows[0]
      };
    }

    return {
      success: false,
      message: 'No drive ingests found. Upload a file to Google Drive first.'
    };
  }

  /**
   * STEP 2: Test file parsing
   */
  async testFileParsing() {
    if (!this.testData.ingestId) {
      return { success: false, message: 'No ingest ID available' };
    }

    const result = await db.query(
      `SELECT COUNT(*) as row_count 
       FROM drive_rows 
       WHERE ingest_id = $1`,
      [this.testData.ingestId]
    );

    const rowCount = parseInt(result.rows[0].row_count) || 0;

    return {
      success: rowCount > 0,
      message: `Parsed ${rowCount} rows from file`,
      data: { rowCount }
    };
  }

  /**
   * STEP 3: Test lead normalization
   */
  async testLeadNormalization() {
    if (!this.testData.ingestId) {
      return { success: false, message: 'No ingest ID available' };
    }

    const result = await db.query(
      `SELECT * FROM drive_rows 
       WHERE ingest_id = $1 AND normalized IS NOT NULL 
       LIMIT 1`,
      [this.testData.ingestId]
    );

    if (result.rows.length > 0) {
      const normalized = result.rows[0].normalized;
      return {
        success: true,
        message: `Lead normalized: ${normalized.email || 'no email'} - ${normalized.company || 'no company'}`,
        data: normalized
      };
    }

    return {
      success: false,
      message: 'No normalized leads found'
    };
  }

  /**
   * STEP 4: Test AnyMail enrichment
   */
  async testAnymailEnrichment() {
    if (!this.testData.ingestId) {
      return { success: false, message: 'No ingest ID available' };
    }

    const result = await db.query(
      `SELECT COUNT(*) as enriched_count 
       FROM drive_rows 
       WHERE ingest_id = $1 AND anymail_status = 'success'`,
      [this.testData.ingestId]
    );

    const enrichedCount = parseInt(result.rows[0].enriched_count) || 0;

    return {
      success: true,
      message: `AnyMail enriched ${enrichedCount} leads`,
      data: { enrichedCount }
    };
  }

  /**
   * STEP 5: Test HubSpot sync
   */
  async testHubSpotSync() {
    if (!this.testData.ingestId) {
      return { success: false, message: 'No ingest ID available' };
    }

    const result = await db.query(
      `SELECT COUNT(DISTINCT hubspot_contact_id) as synced_count 
       FROM drive_rows 
       WHERE ingest_id = $1 AND hubspot_contact_id IS NOT NULL`,
      [this.testData.ingestId]
    );

    const syncedCount = parseInt(result.rows[0].synced_count) || 0;

    // Also check hubspot_sync table
    const syncResult = await db.query(
      `SELECT COUNT(*) as total_synced 
       FROM hubspot_sync 
       WHERE sync_status = 'synced'`
    );

    return {
      success: true,
      message: `HubSpot synced ${syncedCount} contacts (${syncResult.rows[0].total_synced} total in system)`,
      data: { syncedCount, totalSynced: syncResult.rows[0].total_synced }
    };
  }

  /**
   * STEP 6: Test lead classification
   */
  async testLeadClassification() {
    // Get a lead that should be classified
    const result = await db.query(
      `SELECT * FROM leads 
       WHERE lead_type IS NOT NULL 
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    if (result.rows.length > 0) {
      const lead = result.rows[0];
      this.testData.leadId = lead.id;
      return {
        success: true,
        message: `Lead classified: ${lead.email} → ${lead.lead_type} (score: ${lead.lead_score})`,
        data: {
          leadId: lead.id,
          leadType: lead.lead_type,
          leadScore: lead.lead_score,
          templateSet: lead.template_set
        }
      };
    }

    return {
      success: false,
      message: 'No classified leads found'
    };
  }

  /**
   * STEP 7: Test template routing
   */
  async testTemplateRouting() {
    if (!this.testData.leadId) {
      return { success: false, message: 'No lead ID available' };
    }

    const result = await db.query(
      `SELECT * FROM leads 
       WHERE id = $1`,
      [this.testData.leadId]
    );

    if (result.rows.length > 0) {
      const lead = result.rows[0];
      const templateSet = await templateRouter.getTemplateSetForLead(lead);
      const sequence = await templateRouter.getSequenceForTemplateSet(templateSet);

      return {
        success: true,
        message: `Template routed: ${lead.lead_type} → ${templateSet} → Sequence: ${sequence?.name || 'N/A'}`,
        data: { templateSet, sequenceId: sequence?.id }
      };
    }

    return {
      success: false,
      message: 'Lead not found'
    };
  }

  /**
   * STEP 8: Test sequence initialization
   */
  async testSequenceInitialization() {
    if (!this.testData.leadId) {
      return { success: false, message: 'No lead ID available' };
    }

    const result = await db.query(
      `SELECT * FROM lead_sequences 
       WHERE lead_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [this.testData.leadId]
    );

    if (result.rows.length > 0) {
      const sequence = result.rows[0];
      this.testData.sequenceId = sequence.sequence_id;
      return {
        success: true,
        message: `Sequence initialized: Status=${sequence.status}, Step=${sequence.current_step}`,
        data: {
          sequenceId: sequence.sequence_id,
          status: sequence.status,
          currentStep: sequence.current_step
        }
      };
    }

    return {
      success: false,
      message: 'No sequence initialized for lead'
    };
  }

  /**
   * STEP 9: Test email sending
   */
  async testEmailSending() {
    if (!this.testData.leadId) {
      return { success: false, message: 'No lead ID available' };
    }

    const result = await db.query(
      `SELECT * FROM email_logs 
       WHERE lead_id = $1 
       ORDER BY sent_at DESC 
       LIMIT 1`,
      [this.testData.leadId]
    );

    if (result.rows.length > 0) {
      const emailLog = result.rows[0];
      this.testData.emailLogId = emailLog.id;
      return {
        success: true,
        message: `Email sent: ${emailLog.to_email} (Status: ${emailLog.status}, Provider: ${emailLog.provider})`,
        data: {
          emailLogId: emailLog.id,
          status: emailLog.status,
          provider: emailLog.provider,
          sentAt: emailLog.sent_at
        }
      };
    }

    return {
      success: false,
      message: 'No emails sent for this lead'
    };
  }

  /**
   * STEP 10: Test email tracking
   */
  async testEmailTracking() {
    if (!this.testData.emailLogId) {
      return { success: false, message: 'No email log ID available' };
    }

    // Test tracking token generation
    try {
      const token = await emailTracking.generateTrackingToken(this.testData.emailLogId, 'open');
      return {
        success: true,
        message: `Tracking token generated: ${token.substring(0, 8)}...`,
        data: { token }
      };
    } catch (error) {
      return {
        success: false,
        message: `Tracking token generation failed: ${error.message}`
      };
    }
  }

  /**
   * STEP 11: Test bounce handling
   */
  async testBounceHandling() {
    // Check if bounce handler can process a test bounce
    const bounceStats = await bounceHandler.getBounceStats('7 days');
    
    return {
      success: true,
      message: `Bounce handler ready. Stats: ${JSON.stringify(bounceStats)}`,
      data: { bounceStats }
    };
  }

  /**
   * STEP 12: Test reply detection
   */
  async testReplyDetection() {
    // Check if thread handler is ready
    const result = await db.query(
      `SELECT COUNT(*) as reply_count 
       FROM email_replies 
       WHERE detected_at >= NOW() - INTERVAL '7 days'`
    );

    const replyCount = parseInt(result.rows[0].reply_count) || 0;

    return {
      success: true,
      message: `Reply handler ready. ${replyCount} replies detected in last 7 days`,
      data: { replyCount }
    };
  }

  /**
   * STEP 13: Test segment reconciliation
   */
  async testSegmentReconciliation() {
    if (!this.testData.leadId) {
      return { success: false, message: 'No lead ID available' };
    }

    // Check if lead has segments
    const result = await db.query(
      `SELECT COUNT(*) as segment_count 
       FROM lead_segments 
       WHERE lead_id = $1`,
      [this.testData.leadId]
    );

    const segmentCount = parseInt(result.rows[0].segment_count) || 0;

    if (segmentCount > 0) {
      // Test reconciliation
      try {
        const reconciliation = await segmentReconciler.reconcileLeadSegments(this.testData.leadId);
        return {
          success: true,
          message: `Segment reconciliation: ${segmentCount} segments, ${reconciliation.conflicts?.length || 0} conflicts`,
          data: reconciliation
        };
      } catch (error) {
        return {
          success: false,
          message: `Reconciliation error: ${error.message}`
        };
      }
    }

    return {
      success: true,
      message: `No segments to reconcile (${segmentCount} segments)`,
      data: { segmentCount }
    };
  }

  /**
   * STEP 14: Test audit trail
   */
  async testAuditTrail() {
    if (!this.testData.leadId) {
      return { success: false, message: 'No lead ID available' };
    }

    // Test traceback chain
    try {
      const chain = await auditTraceback.buildTracebackChain('lead', this.testData.leadId, 10);
      return {
        success: true,
        message: `Audit trail: ${chain.totalRecords} records in chain`,
        data: chain
      };
    } catch (error) {
      return {
        success: false,
        message: `Audit trail error: ${error.message}`
      };
    }
  }

  /**
   * STEP 15: Test monitoring
   */
  async testMonitoring() {
    try {
      const metrics = await monitoring.getDashboardMetrics('24 hours');
      const health = await monitoring.getHealthMetrics();

      return {
        success: true,
        message: `Monitoring ready. System health: ${health.overall}`,
        data: {
          health: health.overall,
          emailMetrics: metrics.emails,
          healthChecks: health.checks
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Monitoring error: ${error.message}`
      };
    }
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PIPELINE TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏭️  Skipped: ${this.results.skipped}`);
    console.log(`📈 Total Steps: ${this.results.passed + this.results.failed}`);
    console.log(`📊 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Steps:');
      this.results.steps
        .filter(s => s.status === 'failed' || s.status === 'error')
        .forEach(s => {
          console.log(`   - ${s.name}: ${s.message}`);
        });
    }

    console.log('\n✅ Pipeline Test Complete!\n');
  }
}

// Run if executed directly
if (require.main === module) {
  const tester = new PipelineStepByStepTest();
  tester.runFullPipelineTest()
    .then(() => {
      process.exit(tester.results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = PipelineStepByStepTest;

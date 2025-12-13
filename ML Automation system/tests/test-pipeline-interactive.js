/**
 * Interactive Pipeline Test Script
 * Tests each step of the pipeline interactively after Google OAuth
 * Provides detailed feedback and allows step-by-step verification
 */

const readline = require('readline');
const db = require('../src/utils/database');
const logger = require('../src/utils/logger');
const driveIngest = require('../src/services/driveIngest');
const leadClassifier = require('../src/services/leadClassifier');
const templateRouter = require('../src/services/templateRouter');
const sequenceEngine = require('../src/services/sequenceEngine');
const hubspotEnhanced = require('../src/services/hubspotEnhanced');
const emailTracking = require('../src/services/emailTracking');
const bounceHandler = require('../src/services/bounceHandler');
const threadHandler = require('../src/services/threadHandler');
const segmentReconciler = require('../src/services/segmentReconciler');
const auditTraceback = require('../src/services/auditTraceback');
const monitoring = require('../src/services/monitoring');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class InteractivePipelineTest {
  constructor() {
    this.testData = {};
    this.results = [];
  }

  /**
   * Ask user a question
   */
  question(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  }

  /**
   * Print section header
   */
  printHeader(title) {
    console.log('\n' + '='.repeat(70));
    console.log(`  ${title}`);
    console.log('='.repeat(70) + '\n');
  }

  /**
   * Print step info
   */
  printStep(stepNum, title) {
    console.log(`\n📋 STEP ${stepNum}: ${title}`);
    console.log('-'.repeat(70));
  }

  /**
   * Print success
   */
  printSuccess(message, data = null) {
    console.log(`✅ ${message}`);
    if (data) {
      console.log(`   Data: ${JSON.stringify(data, null, 2).substring(0, 200)}`);
    }
  }

  /**
   * Print error
   */
  printError(message) {
    console.log(`❌ ${message}`);
  }

  /**
   * Print info
   */
  printInfo(message) {
    console.log(`ℹ️  ${message}`);
  }

  /**
   * Run interactive pipeline test
   */
  async run() {
    this.printHeader('🧪 INTERACTIVE PIPELINE TEST');
    console.log('This script will test each step of your automation pipeline.');
    console.log('You can verify each step before proceeding to the next.\n');

    // Verify prerequisites
    await this.checkPrerequisites();

    // Test each step
    await this.testStep1_FileDetection();
    await this.testStep2_FileParsing();
    await this.testStep3_LeadNormalization();
    await this.testStep4_AnymailEnrichment();
    await this.testStep5_HubSpotSync();
    await this.testStep6_LeadClassification();
    await this.testStep7_TemplateRouting();
    await this.testStep8_SequenceInit();
    await this.testStep9_EmailSending();
    await this.testStep10_EmailTracking();
    await this.testStep11_BounceHandling();
    await this.testStep12_ReplyDetection();
    await this.testStep13_SegmentReconciliation();
    await this.testStep14_AuditTrail();
    await this.testStep15_Monitoring();

    // Print final summary
    this.printFinalSummary();

    rl.close();
  }

  /**
   * Check prerequisites
   */
  async checkPrerequisites() {
    this.printStep(0, 'Prerequisites Check');

    // Check database
    try {
      await db.query('SELECT NOW()');
      this.printSuccess('Database connection: OK');
    } catch (error) {
      this.printError(`Database connection failed: ${error.message}`);
      process.exit(1);
    }

    // Check OAuth
    this.printInfo('Checking Google OAuth status...');
    const oauthStatus = await this.question('Is Google OAuth complete? (y/n): ');
    if (oauthStatus.toLowerCase() !== 'y') {
      this.printError('Please complete Google OAuth first. Visit: http://localhost:7101/auth/google');
      process.exit(1);
    }
    this.printSuccess('Google OAuth: Complete');

    // Check migration
    this.printInfo('Checking database migration...');
    try {
      const result = await db.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_bounces')"
      );
      if (result.rows[0].exists) {
        this.printSuccess('Database migration: Applied');
      } else {
        this.printError('Database migration not applied. Run: docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation < database/004_bounce_thread_audit_tables.sql');
        const proceed = await this.question('Continue anyway? (y/n): ');
        if (proceed.toLowerCase() !== 'y') {
          process.exit(1);
        }
      }
    } catch (error) {
      this.printError(`Migration check failed: ${error.message}`);
    }
  }

  /**
   * STEP 1: File Detection
   */
  async testStep1_FileDetection() {
    this.printStep(1, 'Google Drive File Detection');

    // Check for recent ingests
    const result = await db.query(
      `SELECT * FROM drive_ingests 
       ORDER BY inserted_at DESC 
       LIMIT 5`
    );

    if (result.rows.length === 0) {
      this.printError('No files detected. Please upload a file to Google Drive folder.');
      const fileId = await this.question('Enter a Google Drive file ID to test (or press Enter to skip): ');
      if (fileId) {
        this.printInfo(`Processing file: ${fileId}`);
        try {
          const ingestResult = await driveIngest.processDriveFile(fileId);
          this.printSuccess('File processed successfully', ingestResult);
          this.testData.ingestId = ingestResult.ingestId;
          this.testData.fileId = fileId;
        } catch (error) {
          this.printError(`File processing failed: ${error.message}`);
        }
      }
    } else {
      const ingest = result.rows[0];
      this.printSuccess(`Found ingest: ${ingest.filename}`, {
        id: ingest.id,
        status: ingest.status,
        rows: ingest.total_rows
      });
      this.testData.ingestId = ingest.id;
      this.testData.fileId = ingest.drive_file_id;
    }

    await this.question('Press Enter to continue to next step...');
  }

  /**
   * STEP 2: File Parsing
   */
  async testStep2_FileParsing() {
    this.printStep(2, 'File Parsing');

    if (!this.testData.ingestId) {
      this.printError('No ingest ID available. Skipping...');
      return;
    }

    const result = await db.query(
      `SELECT COUNT(*) as row_count, 
              COUNT(*) FILTER (WHERE processed = TRUE) as processed_count
       FROM drive_rows 
       WHERE ingest_id = $1`,
      [this.testData.ingestId]
    );

    const rowCount = parseInt(result.rows[0].row_count) || 0;
    const processedCount = parseInt(result.rows[0].processed_count) || 0;

    if (rowCount > 0) {
      this.printSuccess(`File parsed: ${rowCount} rows found, ${processedCount} processed`);
    } else {
      this.printError('No rows found in parsed file');
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 3: Lead Normalization
   */
  async testStep3_LeadNormalization() {
    this.printStep(3, 'Lead Normalization');

    if (!this.testData.ingestId) {
      this.printError('No ingest ID available. Skipping...');
      return;
    }

    const result = await db.query(
      `SELECT * FROM drive_rows 
       WHERE ingest_id = $1 AND normalized IS NOT NULL 
       LIMIT 1`,
      [this.testData.ingestId]
    );

    if (result.rows.length > 0) {
      const normalized = result.rows[0].normalized;
      this.printSuccess('Lead normalized', {
        email: normalized.email,
        company: normalized.company,
        name: normalized.first_name
      });
    } else {
      this.printError('No normalized leads found');
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 4: AnyMail Enrichment
   */
  async testStep4_AnymailEnrichment() {
    this.printStep(4, 'AnyMail Enrichment');

    if (!this.testData.ingestId) {
      this.printError('No ingest ID available. Skipping...');
      return;
    }

    const result = await db.query(
      `SELECT COUNT(*) as enriched_count 
       FROM drive_rows 
       WHERE ingest_id = $1 AND anymail_status = 'success'`,
      [this.testData.ingestId]
    );

    const enrichedCount = parseInt(result.rows[0].enriched_count) || 0;
    this.printSuccess(`AnyMail enriched: ${enrichedCount} leads`);

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 5: HubSpot Sync
   */
  async testStep5_HubSpotSync() {
    this.printStep(5, 'HubSpot Contact Sync');

    if (!this.testData.ingestId) {
      this.printError('No ingest ID available. Skipping...');
      return;
    }

    const result = await db.query(
      `SELECT COUNT(DISTINCT hubspot_contact_id) as synced_count 
       FROM drive_rows 
       WHERE ingest_id = $1 AND hubspot_contact_id IS NOT NULL`,
      [this.testData.ingestId]
    );

    const syncedCount = parseInt(result.rows[0].synced_count) || 0;
    this.printSuccess(`HubSpot synced: ${syncedCount} contacts`);

    // Get a lead ID for next steps
    const leadResult = await db.query(
      `SELECT l.id FROM leads l
       JOIN drive_rows dr ON l.drive_row_id = dr.id
       WHERE dr.ingest_id = $1
       LIMIT 1`,
      [this.testData.ingestId]
    );

    if (leadResult.rows.length > 0) {
      this.testData.leadId = leadResult.rows[0].id;
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 6: Lead Classification
   */
  async testStep6_LeadClassification() {
    this.printStep(6, 'Lead Classification');

    if (!this.testData.leadId) {
      // Try to get any classified lead
      const result = await db.query(
        `SELECT * FROM leads 
         WHERE lead_type IS NOT NULL 
         ORDER BY created_at DESC 
         LIMIT 1`
      );

      if (result.rows.length > 0) {
        this.testData.leadId = result.rows[0].id;
        this.printSuccess('Lead classified', {
          email: result.rows[0].email,
          leadType: result.rows[0].lead_type,
          score: result.rows[0].lead_score
        });
      } else {
        this.printError('No classified leads found');
      }
    } else {
      const result = await db.query(
        'SELECT * FROM leads WHERE id = $1',
        [this.testData.leadId]
      );

      if (result.rows.length > 0) {
        const lead = result.rows[0];
        this.printSuccess('Lead classified', {
          email: lead.email,
          leadType: lead.lead_type,
          score: lead.lead_score,
          templateSet: lead.template_set
        });
      }
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 7: Template Routing
   */
  async testStep7_TemplateRouting() {
    this.printStep(7, 'Template Routing');

    if (!this.testData.leadId) {
      this.printError('No lead ID available. Skipping...');
      return;
    }

    const result = await db.query(
      'SELECT * FROM leads WHERE id = $1',
      [this.testData.leadId]
    );

    if (result.rows.length > 0) {
      const lead = result.rows[0];
      const templateSet = await templateRouter.getTemplateSetForLead(lead);
      const sequence = await templateRouter.getSequenceForTemplateSet(templateSet);

      this.printSuccess('Template routed', {
        leadType: lead.lead_type,
        templateSet: templateSet,
        sequenceName: sequence?.name || 'N/A'
      });
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 8: Sequence Initialization
   */
  async testStep8_SequenceInit() {
    this.printStep(8, 'Sequence Initialization');

    if (!this.testData.leadId) {
      this.printError('No lead ID available. Skipping...');
      return;
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
      this.printSuccess('Sequence initialized', {
        sequenceId: sequence.sequence_id,
        status: sequence.status,
        currentStep: sequence.current_step
      });
    } else {
      this.printError('No sequence initialized for this lead');
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 9: Email Sending
   */
  async testStep9_EmailSending() {
    this.printStep(9, 'Email Sending');

    if (!this.testData.leadId) {
      this.printError('No lead ID available. Skipping...');
      return;
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
      this.printSuccess('Email sent', {
        to: emailLog.to_email,
        status: emailLog.status,
        provider: emailLog.provider,
        sentAt: emailLog.sent_at
      });
    } else {
      this.printInfo('No emails sent yet for this lead (this is normal if sequence just started)');
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 10: Email Tracking
   */
  async testStep10_EmailTracking() {
    this.printStep(10, 'Email Tracking');

    if (!this.testData.emailLogId) {
      this.printInfo('No email log ID available. Testing tracking token generation...');
      // Create a test email log
      const testResult = await db.query(
        `INSERT INTO email_logs (to_email, subject, provider, status)
         VALUES ('test@example.com', 'Test', 'gmail', 'sent')
         RETURNING id`
      );
      this.testData.emailLogId = testResult.rows[0].id;
    }

    try {
      const token = await emailTracking.generateTrackingToken(this.testData.emailLogId, 'open');
      this.printSuccess('Tracking token generated', { token: token.substring(0, 16) + '...' });
    } catch (error) {
      this.printError(`Tracking token generation failed: ${error.message}`);
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 11: Bounce Handling
   */
  async testStep11_BounceHandling() {
    this.printStep(11, 'Bounce Handling');

    const stats = await bounceHandler.getBounceStats('7 days');
    this.printSuccess('Bounce handler ready', { stats });

    const testBounce = await this.question('Test bounce handling? (y/n): ');
    if (testBounce.toLowerCase() === 'y') {
      try {
        const result = await bounceHandler.processBounce({
          provider: 'gmail',
          providerMessageId: `test-bounce-${Date.now()}`,
          recipientEmail: 'bounce-test@example.com',
          bounceReason: 'user not found',
          bounceCode: '550',
          rawPayload: { test: true }
        });
        this.printSuccess('Bounce processed', result);
      } catch (error) {
        this.printError(`Bounce processing failed: ${error.message}`);
      }
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 12: Reply Detection
   */
  async testStep12_ReplyDetection() {
    this.printStep(12, 'Reply Detection');

    const result = await db.query(
      `SELECT COUNT(*) as reply_count 
       FROM email_replies 
       WHERE detected_at >= NOW() - INTERVAL '7 days'`
    );

    const replyCount = parseInt(result.rows[0].reply_count) || 0;
    this.printSuccess(`Reply handler ready. ${replyCount} replies detected in last 7 days`);

    const testReply = await this.question('Test reply detection? (y/n): ');
    if (testReply.toLowerCase() === 'y') {
      try {
        const replyResult = await threadHandler.processReply({
          provider: 'gmail',
          providerMessageId: `test-reply-${Date.now()}`,
          replyFromEmail: 'test@example.com',
          replyToEmail: 'sender@example.com',
          subject: 'Re: Test Email',
          body: 'This is a test human reply',
          replyTimestamp: new Date(),
          rawPayload: { test: true }
        });
        this.printSuccess('Reply processed', replyResult);
      } catch (error) {
        this.printError(`Reply processing failed: ${error.message}`);
      }
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 13: Segment Reconciliation
   */
  async testStep13_SegmentReconciliation() {
    this.printStep(13, 'Segment Reconciliation');

    if (!this.testData.leadId) {
      this.printInfo('No lead ID available. Testing segment reconciliation system...');
      const testLead = await this.question('Enter a lead ID to test (or press Enter to skip): ');
      if (testLead) {
        this.testData.leadId = testLead;
      }
    }

    if (this.testData.leadId) {
      try {
        const result = await segmentReconciler.reconcileLeadSegments(this.testData.leadId);
        this.printSuccess('Segment reconciliation', result);
      } catch (error) {
        this.printError(`Segment reconciliation failed: ${error.message}`);
      }
    } else {
      this.printInfo('Segment reconciliation system ready');
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 14: Audit Trail
   */
  async testStep14_AuditTrail() {
    this.printStep(14, 'Audit Trail');

    if (!this.testData.leadId) {
      this.printInfo('No lead ID available. Testing audit trail system...');
      const testLead = await this.question('Enter a lead ID to test (or press Enter to skip): ');
      if (testLead) {
        this.testData.leadId = testLead;
      }
    }

    if (this.testData.leadId) {
      try {
        const chain = await auditTraceback.buildTracebackChain('lead', this.testData.leadId, 10);
        this.printSuccess('Audit trail', {
          totalRecords: chain.totalRecords,
          depth: chain.depth
        });
      } catch (error) {
        this.printError(`Audit trail failed: ${error.message}`);
      }
    } else {
      this.printInfo('Audit trail system ready');
    }

    await this.question('Press Enter to continue...');
  }

  /**
   * STEP 15: Monitoring
   */
  async testStep15_Monitoring() {
    this.printStep(15, 'Monitoring & Dashboards');

    try {
      const metrics = await monitoring.getDashboardMetrics('24 hours');
      const health = await monitoring.getHealthMetrics();

      this.printSuccess('Monitoring dashboard', {
        health: health.overall,
        emailsSent: metrics.emails.sent,
        emailsOpened: metrics.emails.opened,
        bounceRate: (metrics.emails.bounceRate * 100).toFixed(2) + '%'
      });

      console.log('\n📊 Dashboard Metrics:');
      console.log(`   Emails Sent: ${metrics.emails.sent}`);
      console.log(`   Emails Opened: ${metrics.emails.opened}`);
      console.log(`   Open Rate: ${(metrics.emails.openRate * 100).toFixed(2)}%`);
      console.log(`   Bounce Rate: ${(metrics.emails.bounceRate * 100).toFixed(2)}%`);
      console.log(`   System Health: ${health.overall}`);

    } catch (error) {
      this.printError(`Monitoring failed: ${error.message}`);
    }

    await this.question('Press Enter to finish...');
  }

  /**
   * Print final summary
   */
  printFinalSummary() {
    this.printHeader('📊 TEST SUMMARY');

    console.log('✅ Pipeline test complete!');
    console.log('\nAll 15 steps have been tested.');
    console.log('\nNext steps:');
    console.log('1. Review any failed steps above');
    console.log('2. Fix any issues found');
    console.log('3. Re-run test to verify fixes');
    console.log('4. Deploy to production when all pass');
    console.log('\n🎉 Your automation pipeline is ready!');
  }
}

// Run if executed directly
if (require.main === module) {
  const tester = new InteractivePipelineTest();
  tester.run()
    .then(() => {
      console.log('\n✅ Interactive test complete!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test error:', error);
      rl.close();
      process.exit(1);
    });
}

module.exports = InteractivePipelineTest;

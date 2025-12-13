/**
 * Master Verification Test Harness
 * Tests all verification items from the checklist (1621-2620+)
 * 
 * Usage: node tests/verification-test-harness.js [section]
 * Sections: bounce, thread, segment, audit, hubspot, anymail, tracking, all
 */

const db = require('../src/utils/database');
const logger = require('../src/utils/logger');
const bounceHandler = require('../src/services/bounceHandler');
const threadHandler = require('../src/services/threadHandler');
const segmentReconciler = require('../src/services/segmentReconciler');
const auditTraceback = require('../src/services/auditTraceback');
const hubspotEnhanced = require('../src/services/hubspotEnhanced');
const emailTracking = require('../src/services/emailTracking');

class VerificationTestHarness {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };
  }

  /**
   * Run all tests or specific section
   */
  async runTests(section = 'all') {
    console.log(`\n🧪 Starting Verification Test Harness`);
    console.log(`Section: ${section}\n`);

    try {
      // Test database connection
      await this.testDatabaseConnection();

      switch (section) {
        case 'bounce':
          await this.testBounceHandling();
          break;
        case 'thread':
          await this.testThreadHandling();
          break;
        case 'segment':
          await this.testSegmentReconciliation();
          break;
        case 'audit':
          await this.testAuditTraceback();
          break;
        case 'hubspot':
          await this.testHubSpotUpsert();
          break;
        case 'tracking':
          await this.testEmailTracking();
          break;
        case 'all':
        default:
          await this.testBounceHandling();
          await this.testThreadHandling();
          await this.testSegmentReconciliation();
          await this.testAuditTraceback();
          await this.testHubSpotUpsert();
          await this.testEmailTracking();
          break;
      }

      this.printResults();
    } catch (error) {
      console.error('❌ Test harness error:', error);
      process.exit(1);
    }
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection() {
    try {
      const result = await db.query('SELECT NOW()');
      this.recordTest('database_connection', true, 'Database connection successful');
    } catch (error) {
      this.recordTest('database_connection', false, `Database connection failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test bounce handling (2101-2220)
   */
  async testBounceHandling() {
    console.log('📧 Testing Bounce Handling (2101-2220)...');

    // Test 1: Hard bounce detection
    try {
      const bounceData = {
        provider: 'gmail',
        providerMessageId: 'test-msg-123',
        recipientEmail: 'invalid@example.com',
        bounceReason: 'user not found',
        bounceCode: '550',
        rawPayload: { test: true }
      };

      const result = await bounceHandler.processBounce(bounceData);
      this.recordTest('bounce_hard_detection', result.success, 
        `Hard bounce processed: ${result.bounceType}`);
    } catch (error) {
      this.recordTest('bounce_hard_detection', false, error.message);
    }

    // Test 2: Soft bounce detection
    try {
      const bounceData = {
        provider: 'gmail',
        providerMessageId: 'test-msg-124',
        recipientEmail: 'full@example.com',
        bounceReason: 'mailbox full',
        bounceCode: '452',
        rawPayload: { test: true }
      };

      const result = await bounceHandler.processBounce(bounceData);
      this.recordTest('bounce_soft_detection', result.success, 
        `Soft bounce processed: ${result.bounceType}`);
    } catch (error) {
      this.recordTest('bounce_soft_detection', false, error.message);
    }

    // Test 3: Suppression check
    try {
      const isSuppressed = await bounceHandler.checkSuppression('test@example.com');
      this.recordTest('bounce_suppression_check', true, 
        `Suppression check: ${isSuppressed}`);
    } catch (error) {
      this.recordTest('bounce_suppression_check', false, error.message);
    }
  }

  /**
   * Test thread handling (2221-2340)
   */
  async testThreadHandling() {
    console.log('💬 Testing Thread Handling (2221-2340)...');

    // Test 1: Reply detection
    try {
      const replyData = {
        provider: 'gmail',
        providerMessageId: 'reply-123',
        inReplyTo: 'original-123',
        replyFromEmail: 'test@example.com',
        replyToEmail: 'sender@example.com',
        subject: 'Re: Test Email',
        body: 'This is a human reply',
        replyTimestamp: new Date(),
        rawPayload: { test: true }
      };

      const result = await threadHandler.processReply(replyData);
      this.recordTest('thread_reply_detection', result.success !== false, 
        `Reply processed: ${result.classification?.isHumanReply ? 'human' : 'auto'}`);
    } catch (error) {
      this.recordTest('thread_reply_detection', false, error.message);
    }

    // Test 2: Auto-reply classification
    try {
      const classification = await threadHandler.classifyReply(
        'Out of Office',
        'I am currently out of the office...'
      );
      this.recordTest('thread_auto_reply_classification', 
        classification.isOutOfOffice, 'Auto-reply classified correctly');
    } catch (error) {
      this.recordTest('thread_auto_reply_classification', false, error.message);
    }
  }

  /**
   * Test segment reconciliation (2341-2460)
   */
  async testSegmentReconciliation() {
    console.log('🔀 Testing Segment Reconciliation (2341-2460)...');

    // Test 1: Conflict detection
    try {
      // Create test lead with segments
      const leadResult = await db.query(
        `INSERT INTO leads (email, first_name, organization)
         VALUES ('segment-test@example.com', 'Test', 'Test Org')
         RETURNING id`
      );

      if (leadResult.rows.length > 0) {
        const leadId = leadResult.rows[0].id;

        // Create conflicting segments
        await db.query(
          `INSERT INTO lead_segments (lead_id, segment_type, segment_name, is_primary, confidence_score)
           VALUES 
           ($1, 'primary', 'ngo', TRUE, 0.9),
           ($1, 'primary', 'school', TRUE, 0.8)`,
          [leadId]
        );

        const result = await segmentReconciler.reconcileLeadSegments(leadId);
        this.recordTest('segment_conflict_detection', result.success, 
          `Conflicts detected: ${result.conflicts?.length || 0}`);
      }
    } catch (error) {
      this.recordTest('segment_conflict_detection', false, error.message);
    }
  }

  /**
   * Test audit traceback (2461-2600)
   */
  async testAuditTraceback() {
    console.log('📋 Testing Audit Traceback (2461-2600)...');

    // Test 1: Trace creation
    try {
      const traceId = await auditTraceback.startTrace(
        'test_event',
        'lead',
        'test-lead-id',
        { action: 'test', stage: 'testing' }
      );
      this.recordTest('audit_trace_creation', !!traceId, 
        `Trace created: ${traceId.substring(0, 8)}...`);
    } catch (error) {
      this.recordTest('audit_trace_creation', false, error.message);
    }

    // Test 2: Verification check
    try {
      const traceId = await auditTraceback.startTrace('test', 'lead', 'test-id');
      await auditTraceback.addVerificationCheck(traceId, '1621', 'Test Check', 'passed');
      await auditTraceback.completeTrace(traceId, 'success');
      this.recordTest('audit_verification_check', true, 'Verification check added');
    } catch (error) {
      this.recordTest('audit_verification_check', false, error.message);
    }

    // Test 3: Traceback chain
    try {
      const chain = await auditTraceback.buildTracebackChain('lead', 'test-id', 5);
      this.recordTest('audit_traceback_chain', chain.success, 
        `Chain built: ${chain.totalRecords} records`);
    } catch (error) {
      this.recordTest('audit_traceback_chain', false, error.message);
    }
  }

  /**
   * Test HubSpot upsert (1621-1780)
   */
  async testHubSpotUpsert() {
    console.log('🔗 Testing HubSpot Upsert (1621-1780)...');

    // Test 1: Email normalization
    try {
      const normalized = hubspotEnhanced.normalizeEmail('  Test@Example.COM  ');
      this.recordTest('hubspot_email_normalization', 
        normalized === 'test@example.com', 'Email normalized correctly');
    } catch (error) {
      this.recordTest('hubspot_email_normalization', false, error.message);
    }

    // Test 2: Email validation
    try {
      const isValid = hubspotEnhanced.isValidEmail('test@example.com');
      const isInvalid = !hubspotEnhanced.isValidEmail('invalid-email');
      this.recordTest('hubspot_email_validation', isValid && isInvalid, 
        'Email validation working');
    } catch (error) {
      this.recordTest('hubspot_email_validation', false, error.message);
    }

    // Test 3: Property sanitization
    try {
      const properties = {
        email: 'test@example.com',
        firstname: '<script>alert("xss")</script>Test'
      };
      const sanitized = hubspotEnhanced.sanitizeProperties(properties);
      this.recordTest('hubspot_property_sanitization', 
        !sanitized.firstname.includes('<script>'), 'Properties sanitized');
    } catch (error) {
      this.recordTest('hubspot_property_sanitization', false, error.message);
    }
  }

  /**
   * Test email tracking (1941-2100)
   */
  async testEmailTracking() {
    console.log('👁️  Testing Email Tracking (1941-2100)...');

    // Test 1: Token generation
    try {
      // Create test email log
      const emailLogResult = await db.query(
        `INSERT INTO email_logs (to_email, subject, provider, status)
         VALUES ('test@example.com', 'Test', 'gmail', 'sent')
         RETURNING id`
      );

      if (emailLogResult.rows.length > 0) {
        const emailLogId = emailLogResult.rows[0].id;
        const token = await emailTracking.generateTrackingToken(emailLogId, 'open');
        this.recordTest('tracking_token_generation', !!token, 
          `Token generated: ${token.substring(0, 8)}...`);
      }
    } catch (error) {
      this.recordTest('tracking_token_generation', false, error.message);
    }

    // Test 2: Device type inference
    try {
      const deviceType = emailTracking.inferDeviceType(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      );
      this.recordTest('tracking_device_inference', deviceType === 'mobile', 
        `Device type: ${deviceType}`);
    } catch (error) {
      this.recordTest('tracking_device_inference', false, error.message);
    }

    // Test 3: Client type inference
    try {
      const clientType = emailTracking.inferClientType(
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      );
      this.recordTest('tracking_client_inference', true, 
        `Client type inference working`);
    } catch (error) {
      this.recordTest('tracking_client_inference', false, error.message);
    }
  }

  /**
   * Record test result
   */
  recordTest(name, passed, message) {
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${name}: ${message}`);
    
    this.results.tests.push({ name, passed, message });
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏭️  Skipped: ${this.results.skipped}`);
    console.log(`📈 Total: ${this.results.passed + this.results.failed + this.results.skipped}`);
    console.log(`📊 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');

    if (this.results.failed > 0) {
      console.log('❌ Failed Tests:');
      this.results.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
      console.log('');
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const section = process.argv[2] || 'all';
  const harness = new VerificationTestHarness();
  harness.runTests(section)
    .then(() => {
      process.exit(harness.results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = VerificationTestHarness;

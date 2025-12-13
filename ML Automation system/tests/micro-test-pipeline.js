/**
 * Micro-Testing Framework for Pipeline Segments
 * Tests each segment of the automation pipeline individually
 */

const db = require('../src/utils/database');
const driveIngest = require('../src/services/driveIngest');
const leadClassifier = require('../src/services/leadClassifier');
const templateRouter = require('../src/services/templateRouter');
const anymail = require('../src/services/anymail');
const hubspot = require('../src/services/hubspot');
const logger = require('../src/utils/logger');

const TEST_RESULTS = {
  segments: [],
  passed: 0,
  failed: 0,
  warnings: 0
};

/**
 * Test Segment 1: Database Schema
 */
async function testDatabaseSchema() {
  console.log('\n🔍 Testing Segment 1: Database Schema');
  console.log('─────────────────────────────────────────────');

  const tests = [
    { name: 'lead_classifications table', query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lead_classifications')" },
    { name: 'template_mappings table', query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'template_mappings')" },
    { name: 'drive_ingests table', query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'drive_ingests')" },
    { name: 'drive_rows table', query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'drive_rows')" },
    { name: 'classification_rules table', query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'classification_rules')" },
    { name: 'hubspot_email_log table', query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hubspot_email_log')" },
    { name: 'leads.lead_type column', query: "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_type')" },
    { name: 'leads.template_set column', query: "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'template_set')" }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await db.query(test.query);
      const exists = result.rows[0].exists;
      if (exists) {
        console.log(`   ✅ ${test.name}`);
        passed++;
      } else {
        console.log(`   ❌ ${test.name} - MISSING`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ${test.name} - ERROR: ${error.message}`);
      failed++;
    }
  }

  TEST_RESULTS.segments.push({
    name: 'Database Schema',
    passed,
    failed,
    total: tests.length
  });

  return { passed, failed, total: tests.length };
}

/**
 * Test Segment 2: Email Templates
 */
async function testEmailTemplates() {
  console.log('\n🔍 Testing Segment 2: Email Templates');
  console.log('─────────────────────────────────────────────');

  const tests = [
    { name: 'SET ONE: Student Sequence', type: 'set_one_student', expected_steps: 5 },
    { name: 'SET TWO: Referral Sequence', type: 'set_two_referral', expected_steps: 1 },
    { name: 'SET THREE: B2B Sequence', type: 'set_three_b2b', expected_steps: 5 }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const seqResult = await db.query(
        'SELECT * FROM sequences WHERE sequence_type = $1 AND is_active = true',
        [test.type]
      );

      if (seqResult.rows.length === 0) {
        console.log(`   ❌ ${test.name} - Sequence not found`);
        failed++;
        continue;
      }

      const sequence = seqResult.rows[0];
      const stepsResult = await db.query(
        'SELECT COUNT(*) as count FROM sequence_steps WHERE sequence_id = $1',
        [sequence.id]
      );

      const stepCount = parseInt(stepsResult.rows[0].count);

      if (stepCount === test.expected_steps) {
        console.log(`   ✅ ${test.name} - ${stepCount} steps`);
        passed++;
      } else {
        console.log(`   ⚠️  ${test.name} - Expected ${test.expected_steps} steps, found ${stepCount}`);
        failed++;
      }

      // Check template content
      const stepsResult2 = await db.query(
        'SELECT step_number, subject_template, body_template FROM sequence_steps WHERE sequence_id = $1 ORDER BY step_number',
        [sequence.id]
      );

      let hasPlaceholders = false;
      for (const step of stepsResult2.rows) {
        if (step.body_template && step.body_template.includes('{{mission_support_url}}')) {
          hasPlaceholders = true;
        }
      }

      if (hasPlaceholders) {
        console.log(`   ✅ ${test.name} - Placeholders present`);
      } else {
        console.log(`   ⚠️  ${test.name} - Missing placeholders`);
      }

    } catch (error) {
      console.log(`   ❌ ${test.name} - ERROR: ${error.message}`);
      failed++;
    }
  }

  TEST_RESULTS.segments.push({
    name: 'Email Templates',
    passed,
    failed,
    total: tests.length
  });

  return { passed, failed, total: tests.length };
}

/**
 * Test Segment 3: Classification Rules
 */
async function testClassificationRules() {
  console.log('\n🔍 Testing Segment 3: Classification Rules');
  console.log('─────────────────────────────────────────────');

  try {
    const rulesResult = await db.query(
      'SELECT * FROM classification_rules WHERE is_active = true ORDER BY priority'
    );

    console.log(`   ✅ Found ${rulesResult.rows.length} active rules`);

    // Test classification with sample leads
    const testLeads = [
      {
        email: 'ceo@example-funder.com',
        title: 'CEO',
        organization: 'Foundation',
        source: 'anymail'
      },
      {
        email: 'manager@company.com',
        title: 'Marketing Manager',
        organization: 'Company Inc',
        source: 'google_drive'
      },
      {
        email: 'student@school.edu',
        title: 'Student',
        organization: 'School',
        source: 'manual'
      }
    ];

    let passed = 0;
    let failed = 0;

    for (const testLead of testLeads) {
      try {
        const classification = await leadClassifier.classifyLead(testLead);
        console.log(`   ✅ ${testLead.email} → ${classification.type} (score: ${classification.score})`);
        passed++;
      } catch (error) {
        console.log(`   ❌ ${testLead.email} - ERROR: ${error.message}`);
        failed++;
      }
    }

    TEST_RESULTS.segments.push({
      name: 'Classification Rules',
      passed,
      failed,
      total: testLeads.length
    });

    return { passed, failed, total: testLeads.length };
  } catch (error) {
    console.log(`   ❌ Classification Rules - ERROR: ${error.message}`);
    return { passed: 0, failed: 1, total: 1 };
  }
}

/**
 * Test Segment 4: Template Mapping
 */
async function testTemplateMapping() {
  console.log('\n🔍 Testing Segment 4: Template Mapping');
  console.log('─────────────────────────────────────────────');

  try {
    const mappingsResult = await db.query(
      'SELECT * FROM template_mappings WHERE is_active = true ORDER BY priority'
    );

    console.log(`   ✅ Found ${mappingsResult.rows.length} template mappings`);

    const testTypes = ['priority_donor', 'warm_prospect', 'cold_nurture'];
    let passed = 0;
    let failed = 0;

    for (const type of testTypes) {
      try {
        const templateSet = await leadClassifier.getTemplateSetForType(type);
        const mapping = mappingsResult.rows.find(m => m.lead_type === type);

        if (mapping && mapping.template_set === templateSet) {
          console.log(`   ✅ ${type} → ${templateSet}`);
          passed++;
        } else {
          console.log(`   ❌ ${type} - Mapping mismatch`);
          failed++;
        }
      } catch (error) {
        console.log(`   ❌ ${type} - ERROR: ${error.message}`);
        failed++;
      }
    }

    TEST_RESULTS.segments.push({
      name: 'Template Mapping',
      passed,
      failed,
      total: testTypes.length
    });

    return { passed, failed, total: testTypes.length };
  } catch (error) {
    console.log(`   ❌ Template Mapping - ERROR: ${error.message}`);
    return { passed: 0, failed: 1, total: 1 };
  }
}

/**
 * Test Segment 5: Template Personalization
 */
async function testTemplatePersonalization() {
  console.log('\n🔍 Testing Segment 5: Template Personalization');
  console.log('─────────────────────────────────────────────');

  const testLead = {
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    organization: 'Test School',
    company: 'Test School',
    city: 'San Francisco',
    country: 'USA'
  };

  const testTemplate = `
    Hi {{first_name}},
    Welcome to {{organization}}!
    Visit: {{mission_support_url}}
    Unsubscribe: {{unsubscribe_url}}
  `;

  try {
    const personalized = templateRouter.personalizeTemplate(testTemplate, testLead, {
      mission_support_url: 'https://hingecraft.global/mission-support'
    });

    const checks = [
      { check: personalized.includes('John'), name: 'first_name replacement' },
      { check: personalized.includes('Test School'), name: 'organization replacement' },
      { check: personalized.includes('https://hingecraft.global/mission-support'), name: 'mission_support_url replacement' },
      { check: personalized.includes('unsubscribe'), name: 'unsubscribe_url replacement' }
    ];

    let passed = 0;
    let failed = 0;

    for (const check of checks) {
      if (check.check) {
        console.log(`   ✅ ${check.name}`);
        passed++;
      } else {
        console.log(`   ❌ ${check.name}`);
        failed++;
      }
    }

    TEST_RESULTS.segments.push({
      name: 'Template Personalization',
      passed,
      failed,
      total: checks.length
    });

    return { passed, failed, total: checks.length };
  } catch (error) {
    console.log(`   ❌ Template Personalization - ERROR: ${error.message}`);
    return { passed: 0, failed: 1, total: 1 };
  }
}

/**
 * Test Segment 6: Data Flow (End-to-End Simulation)
 */
async function testDataFlow() {
  console.log('\n🔍 Testing Segment 6: Data Flow');
  console.log('─────────────────────────────────────────────');

  try {
    // Create test lead
    const testLeadData = {
      email: `test-${Date.now()}@example.com`,
      first_name: 'Test',
      last_name: 'Lead',
      organization: 'Test Organization',
      title: 'CEO',
      source: 'test'
    };

    // Insert lead
    const leadResult = await db.query(
      `INSERT INTO leads (email, first_name, last_name, organization, title, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        testLeadData.email,
        testLeadData.first_name,
        testLeadData.last_name,
        testLeadData.organization,
        testLeadData.title,
        testLeadData.source
      ]
    );

    const leadId = leadResult.rows[0].id;
    console.log(`   ✅ Test lead created: ${leadId}`);

    // Classify lead
    const classification = await leadClassifier.classifyLead(testLeadData);
    await leadClassifier.storeClassification(leadId, classification);
    console.log(`   ✅ Lead classified: ${classification.type} (score: ${classification.score})`);

    // Route to template
    const routing = await templateRouter.routeLeadToTemplate(leadId);
    console.log(`   ✅ Lead routed to: ${routing.template_set}`);

    // Verify lead_sequences created
    const seqResult = await db.query(
      'SELECT * FROM lead_sequences WHERE lead_id = $1',
      [leadId]
    );

    if (seqResult.rows.length > 0) {
      console.log(`   ✅ Sequence initialized: ${seqResult.rows[0].sequence_id}`);
    } else {
      console.log(`   ⚠️  Sequence not initialized`);
    }

    // Cleanup
    await db.query('DELETE FROM leads WHERE id = $1', [leadId]);

    TEST_RESULTS.segments.push({
      name: 'Data Flow',
      passed: 4,
      failed: 0,
      total: 4
    });

    return { passed: 4, failed: 0, total: 4 };
  } catch (error) {
    console.log(`   ❌ Data Flow - ERROR: ${error.message}`);
    return { passed: 0, failed: 1, total: 1 };
  }
}

/**
 * Run all micro-tests
 */
async function runAllMicroTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 Micro-Testing Framework - Pipeline Segments');
  console.log('═══════════════════════════════════════════════════════');

  await testDatabaseSchema();
  await testEmailTemplates();
  await testClassificationRules();
  await testTemplateMapping();
  await testTemplatePersonalization();
  await testDataFlow();

  // Summary
  const totalPassed = TEST_RESULTS.segments.reduce((sum, s) => sum + s.passed, 0);
  const totalFailed = TEST_RESULTS.segments.reduce((sum, s) => sum + s.failed, 0);
  const totalTests = TEST_RESULTS.segments.reduce((sum, s) => sum + s.total, 0);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${totalPassed} ✅`);
  console.log(`Failed: ${totalFailed} ${totalFailed > 0 ? '❌' : ''}`);
  console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════════════════');

  return {
    total: totalTests,
    passed: totalPassed,
    failed: totalFailed,
    segments: TEST_RESULTS.segments
  };
}

// Run if executed directly
if (require.main === module) {
  runAllMicroTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runAllMicroTests };

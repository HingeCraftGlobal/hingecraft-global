/**
 * Load All Email Templates from Database
 * Retrieves all templates for all target markets and makes them available to the system
 */

require('dotenv').config();
const db = require('../src/utils/database');
const logger = require('../src/utils/logger');

async function loadEmailTemplates() {
  try {
    console.log('');
    console.log('='.repeat(80));
    console.log('  LOADING EMAIL TEMPLATES FROM DATABASE');
    console.log('='.repeat(80));
    console.log('');

    // Get all sequences with their steps
    const result = await db.query(`
      SELECT 
        s.sequence_type,
        s.name as sequence_name,
        s.total_steps,
        ss.step_number,
        ss.subject_template,
        ss.body_template,
        ss.template_id,
        ss.delay_hours
      FROM sequences s
      JOIN sequence_steps ss ON s.id = ss.sequence_id
      WHERE s.sequence_type IN ('set_one_student', 'set_two_referral', 'set_three_b2b')
      ORDER BY s.sequence_type, ss.step_number
    `);

    const templates = result.rows;
    console.log(`Found ${templates.length} email templates in database`);
    console.log('');

    // Group by sequence type
    const templatesBySet = {
      'set_one_student': [],
      'set_two_referral': [],
      'set_three_b2b': []
    };

    templates.forEach(template => {
      templatesBySet[template.sequence_type].push({
        step: template.step_number,
        subject: template.subject_template,
        body: template.body_template,
        template_id: template.template_id,
        delay_hours: template.delay_hours
      });
    });

    // Display summary
    console.log('📧 Email Templates by Target Market:');
    console.log('─'.repeat(80));
    
    Object.keys(templatesBySet).forEach(set => {
      const count = templatesBySet[set].length;
      const setNames = {
        'set_one_student': 'Student Movement (5 emails)',
        'set_two_referral': 'Referral Email (1 email)',
        'set_three_b2b': 'B2B Partnerships (5 emails)'
      };
      console.log(`   ${setNames[set]}: ${count} templates`);
    });

    console.log('');
    console.log('✅ All templates loaded from database');
    console.log('');

    // Verify templates are accessible
    console.log('📋 Template Verification:');
    for (const set of Object.keys(templatesBySet)) {
      const setTemplates = templatesBySet[set];
      console.log(`   ${set}:`);
      setTemplates.forEach(t => {
        console.log(`      Step ${t.step}: ${t.subject.substring(0, 50)}...`);
      });
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('  ✅ TEMPLATES LOADED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log('');

    return {
      success: true,
      total: templates.length,
      bySet: templatesBySet
    };
  } catch (error) {
    logger.error('Error loading templates:', error);
    console.error('');
    console.error('❌ Error loading templates:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  loadEmailTemplates()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { loadEmailTemplates };

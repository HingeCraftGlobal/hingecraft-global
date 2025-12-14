/**
 * Verify Email Templates Loaded
 * Checks that all templates from database are accessible
 */

require('dotenv').config();
const emailTemplateLoader = require('../src/services/emailTemplateLoader');
const logger = require('../src/utils/logger');

async function verifyTemplates() {
  try {
    console.log('');
    console.log('='.repeat(80));
    console.log('  VERIFYING EMAIL TEMPLATES FROM DATABASE');
    console.log('='.repeat(80));
    console.log('');

    // Load all templates
    const templates = await emailTemplateLoader.loadAllTemplates();
    const summary = await emailTemplateLoader.getTemplateSummary();

    console.log('📧 Template Summary:');
    console.log('─'.repeat(80));
    
    Object.keys(summary).forEach(set => {
      const setNames = {
        'set_one_student': 'Student Movement',
        'set_two_referral': 'Referral Email',
        'set_three_b2b': 'B2B Partnerships'
      };
      console.log(`   ${setNames[set]}: ${summary[set].count} templates (steps: ${summary[set].steps.join(', ')})`);
    });

    console.log('');
    console.log('📋 Template Details:');
    console.log('─'.repeat(80));

    // Verify each template set
    for (const set of Object.keys(templates)) {
      console.log(`\n   ${set}:`);
      const setTemplates = templates[set];
      
      for (const stepKey of Object.keys(setTemplates)) {
        const template = setTemplates[stepKey];
        const subjectPreview = template.subject.substring(0, 60);
        console.log(`      ${stepKey}: "${subjectPreview}..."`);
      }
    }

    console.log('');
    console.log('✅ All templates verified and accessible');
    console.log('');

    // Test template retrieval
    console.log('🧪 Testing Template Retrieval:');
    console.log('─'.repeat(80));
    
    const testSets = ['set_one_student', 'set_two_referral', 'set_three_b2b'];
    for (const set of testSets) {
      const template = await emailTemplateLoader.getTemplate(set, 1);
      if (template) {
        console.log(`   ✅ ${set} step 1: Retrieved successfully`);
      } else {
        console.log(`   ❌ ${set} step 1: Failed to retrieve`);
      }
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('  ✅ TEMPLATE VERIFICATION COMPLETE');
    console.log('='.repeat(80));
    console.log('');

    return {
      success: true,
      total: Object.values(summary).reduce((sum, s) => sum + s.count, 0),
      summary: summary,
      templates: templates
    };
  } catch (error) {
    logger.error('Error verifying templates:', error);
    console.error('');
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  verifyTemplates()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { verifyTemplates };

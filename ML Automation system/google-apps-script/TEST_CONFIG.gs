/**
 * LIVE TEST CONFIGURATION
 * Single email test to chandlerferguson319@gmail.com
 */

const TEST_CONFIG = {
  TEST_MODE: true,
  TEST_EMAIL: 'chandlerferguson319@gmail.com',
  FROM_EMAIL: 'marketingecraft@gmail.com',
  TEST_LEAD: {
  "first_name": "Chandler",
  "last_name": "Ferguson",
  "company": "HingeCraft Global",
  "website": "https://hingecraft.global",
  "title": "Founder",
  "city": "Denver",
  "state": "Colorado",
  "country": "USA"
},
  QUALIFICATION_PROFILE: {
  "lead_type": "B2B",
  "template_set": "set_three_b2b",
  "initial_step": 1,
  "qualification_score": 0
}
};

/**
 * Test function to send single email
 */
function testSingleEmail() {
  Logger.log('🧪 Starting live test with single email...');
  Logger.log(`Test Email: ${TEST_CONFIG.TEST_EMAIL}`);
  Logger.log(`From Email: ${TEST_CONFIG.FROM_EMAIL}`);
  
  // Create test contact object
  const testContact = {
    id: 'TEST_' + new Date().getTime(),
    properties: {
      email: TEST_CONFIG.TEST_EMAIL,
      firstname: TEST_CONFIG.TEST_LEAD.first_name,
      lastname: TEST_CONFIG.TEST_LEAD.last_name,
      company: TEST_CONFIG.TEST_LEAD.company,
      jobtitle: TEST_CONFIG.TEST_LEAD.title,
      city: TEST_CONFIG.TEST_LEAD.city,
      state: TEST_CONFIG.TEST_LEAD.state,
      country: TEST_CONFIG.TEST_LEAD.country,
      automation_template_set: TEST_CONFIG.QUALIFICATION_PROFILE.template_set,
      automation_lead_type: TEST_CONFIG.QUALIFICATION_PROFILE.lead_type,
      automation_next_email_step: TEST_CONFIG.QUALIFICATION_PROFILE.initial_step.toString(),
      automation_next_send_timestamp: new Date().getTime().toString(),
      automation_emails_sent: '0'
    }
  };
  
  // Determine template set through qualification
  const qualification = qualifyAndGetTemplateSet(testContact);
  const templateSet = qualification.templateSet;
  Logger.log(`Qualification Result:`);
  Logger.log(`  Lead Type: ${qualification.leadType}`);
  Logger.log(`  Template Set: ${templateSet}`);
  Logger.log(`  Qualification Score: ${qualification.score}`);
  Logger.log(`  Indicators: ${qualification.indicators.join(', ')}`);
  
  // Update contact with qualification
  testContact.properties.automation_template_set = templateSet;
  testContact.properties.automation_lead_type = qualification.leadType;
  
  // Get template
  const template = getTemplate(templateSet, 1);
  if (!template) {
    Logger.log('❌ Template not found');
    return;
  }
  
  // Personalize
  const personalized = personalizeTemplate(template, testContact);
  
  // Send email
  try {
    const result = GmailApp.sendEmail(
      TEST_CONFIG.TEST_EMAIL,
      personalized.subject,
      '',
      {
        htmlBody: personalized.body,
        from: TEST_CONFIG.FROM_EMAIL,
        name: 'HingeCraft'
      }
    );
    
    Logger.log('✅ Test email sent successfully!');
    Logger.log(`Message ID: ${result.getMessage().getId()}`);
    Logger.log(`Subject: ${personalized.subject}`);
    Logger.log(`To: ${TEST_CONFIG.TEST_EMAIL}`);
    Logger.log(`From: ${TEST_CONFIG.FROM_EMAIL}`);
    
    return {
      success: true,
      messageId: result.getMessage().getId(),
      email: TEST_CONFIG.TEST_EMAIL,
      subject: personalized.subject
    };
    
  } catch (error) {
    Logger.log(`❌ Error sending test email: ${error.toString()}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Qualification process - determines template set based on profile
 * Full qualification with scoring and indicators
 */
function qualifyAndGetTemplateSet(contact) {
  const company = (contact.properties.company || '').toLowerCase();
  const title = (contact.properties.jobtitle || '').toLowerCase();
  const website = (contact.properties.website || '').toLowerCase();
  const email = (contact.properties.email || '').toLowerCase();
  
  let leadType = 'B2B';
  let templateSet = 'set_three_b2b';
  let score = 0;
  const indicators = [];
  
  // Student Indicators
  const studentIndicators = [
    'school', 'university', 'college', 'academy', 'education',
    'student', 'teacher', 'professor', 'educator'
  ];
  
  // NGO/Referral Indicators
  const ngoIndicators = [
    'ngo', 'nonprofit', 'non-profit', 'foundation', 'charity',
    'organization', 'association', 'society'
  ];
  
  // B2B Indicators
  const b2bIndicators = [
    'corp', 'corporation', 'inc', 'llc', 'ltd', 'company',
    'business', 'enterprise', 'tech', 'software', 'solutions'
  ];
  
  // Check for Student
  const hasStudentIndicator = studentIndicators.some(ind => 
    company.includes(ind) || title.includes(ind) || website.includes(ind)
  );
  
  if (hasStudentIndicator) {
    leadType = 'Student';
    templateSet = 'set_one_student';
    score = 85;
    indicators.push('Student/Education detected');
  }
  
  // Check for NGO
  const hasNgoIndicator = ngoIndicators.some(ind => 
    company.includes(ind) || title.includes(ind) || website.includes(ind)
  );
  
  if (hasNgoIndicator && !hasStudentIndicator) {
    leadType = 'NGO';
    templateSet = 'set_two_referral';
    score = 80;
    indicators.push('NGO/Nonprofit detected');
  }
  
  // Check for B2B
  const hasB2bIndicator = b2bIndicators.some(ind => 
    company.includes(ind) || title.includes(ind) || website.includes(ind)
  );
  
  if (hasB2bIndicator && !hasStudentIndicator && !hasNgoIndicator) {
    leadType = 'B2B';
    templateSet = 'set_three_b2b';
    score = 75;
    indicators.push('B2B company detected');
  }
  
  // Email domain analysis
  if (email.includes('.edu')) {
    leadType = 'Student';
    templateSet = 'set_one_student';
    score = 90;
    indicators.push('Educational email domain (.edu)');
  }
  
  // Default scoring if no indicators
  if (indicators.length === 0) {
    score = 50;
    indicators.push('Default B2B classification');
  }
  
  return {
    leadType: leadType,
    templateSet: templateSet,
    score: score,
    indicators: indicators,
    qualified: true,
    timestamp: new Date().toISOString()
  };
}

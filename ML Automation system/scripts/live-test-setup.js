#!/usr/bin/env node

/**
 * LIVE TEST SETUP - Single Email Test
 * Prepares system for live test with chandlerferguson319@gmail.com
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80));
}

// Test Configuration
const TEST_CONFIG = {
  testEmail: 'chandlerferguson319@gmail.com',
  fromEmail: 'marketingecraft@gmail.com',
  testLead: {
    first_name: 'Chandler',
    last_name: 'Ferguson',
    company: 'HingeCraft Global',
    website: 'https://hingecraft.global',
    title: 'Founder',
    city: 'Denver',
    state: 'Colorado',
    country: 'USA'
  },
  qualificationProfile: {
    lead_type: 'B2B', // Will be determined by qualification
    template_set: 'set_three_b2b',
    initial_step: 1,
    qualification_score: 0 // Will be calculated
  }
};

// Create test CSV file
function createTestFile() {
  logSection('1. CREATING TEST FILE');
  
  const testCsvPath = path.join(__dirname, '..', 'test-live-single-email.csv');
  const csvContent = `First Name,Last Name,Company,Website,Title,City,State,Country
${TEST_CONFIG.testLead.first_name},${TEST_CONFIG.testLead.last_name},${TEST_CONFIG.testLead.company},${TEST_CONFIG.testLead.website},${TEST_CONFIG.testLead.title},${TEST_CONFIG.testLead.city},${TEST_CONFIG.testLead.state},${TEST_CONFIG.testLead.country}`;
  
  fs.writeFileSync(testCsvPath, csvContent);
  log(`✅ Test CSV created: ${testCsvPath}`, 'green');
  log(`   Contains: 1 lead (${TEST_CONFIG.testEmail})`, 'blue');
  
  return testCsvPath;
}

// Create test configuration for Google Apps Script
function createGASTestConfig() {
  logSection('2. CREATING GOOGLE APPS SCRIPT TEST CONFIG');
  
  const configPath = path.join(__dirname, '..', 'google-apps-script', 'TEST_CONFIG.gs');
  const configContent = `/**
 * LIVE TEST CONFIGURATION
 * Single email test to chandlerferguson319@gmail.com
 */

const TEST_CONFIG = {
  TEST_MODE: true,
  TEST_EMAIL: '${TEST_CONFIG.testEmail}',
  FROM_EMAIL: '${TEST_CONFIG.fromEmail}',
  TEST_LEAD: ${JSON.stringify(TEST_CONFIG.testLead, null, 2)},
  QUALIFICATION_PROFILE: ${JSON.stringify(TEST_CONFIG.qualificationProfile, null, 2)}
};

/**
 * Test function to send single email
 */
function testSingleEmail() {
  Logger.log('🧪 Starting live test with single email...');
  Logger.log(\`Test Email: \${TEST_CONFIG.TEST_EMAIL}\`);
  Logger.log(\`From Email: \${TEST_CONFIG.FROM_EMAIL}\`);
  
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
  const templateSet = qualifyAndGetTemplateSet(testContact);
  Logger.log(\`Qualified Template Set: \${templateSet}\`);
  
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
    Logger.log(\`Message ID: \${result.getMessage().getId()}\`);
    Logger.log(\`Subject: \${personalized.subject}\`);
    Logger.log(\`To: \${TEST_CONFIG.TEST_EMAIL}\`);
    Logger.log(\`From: \${TEST_CONFIG.FROM_EMAIL}\`);
    
    return {
      success: true,
      messageId: result.getMessage().getId(),
      email: TEST_CONFIG.TEST_EMAIL,
      subject: personalized.subject
    };
    
  } catch (error) {
    Logger.log(\`❌ Error sending test email: \${error.toString()}\`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Qualification process - determines template set based on profile
 */
function qualifyAndGetTemplateSet(contact) {
  // Qualification logic
  const company = contact.properties.company || '';
  const title = contact.properties.jobtitle || '';
  const website = contact.properties.website || '';
  
  // Check for student indicators
  if (company.toLowerCase().includes('school') || 
      company.toLowerCase().includes('university') ||
      company.toLowerCase().includes('college') ||
      title.toLowerCase().includes('student')) {
    return 'set_one_student';
  }
  
  // Check for NGO/Referral indicators
  if (company.toLowerCase().includes('ngo') ||
      company.toLowerCase().includes('nonprofit') ||
      company.toLowerCase().includes('foundation')) {
    return 'set_two_referral';
  }
  
  // Default to B2B
  return 'set_three_b2b';
}
`;
  
  fs.writeFileSync(configPath, configContent);
  log(`✅ Test config created: ${configPath}`, 'green');
  log('   Function: testSingleEmail()', 'blue');
  
  return configPath;
}

// Create Docker environment file
function createDockerEnv() {
  logSection('3. CREATING DOCKER ENVIRONMENT');
  
  const envPath = path.join(__dirname, '..', '.env.docker');
  const envContent = `# Docker Environment Configuration
# Memory Optimized Settings

# Database
DB_PASSWORD=changeme_secure_password
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hingecraft_automation
DB_USER=hingecraft

# HubSpot
HUBSPOT_TOKEN=pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39

# AnyMail
ANYMAIL_API_KEY=pRUtyDRHSPageC2jHGbnWGpD

# Google Drive
GOOGLE_DRIVE_FOLDER_ID=1iTirAf6yGxP9ef2sxXfohJRmQEJoF-gF

# Email
GMAIL_FROM_ADDRESS=marketingecraft@gmail.com
TEST_EMAIL=chandlerferguson319@gmail.com

# Node.js Memory Limits
NODE_OPTIONS=--max-old-space-size=512

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_MAX_MEMORY=256mb

# API
PORT=3000
NODE_ENV=production
`;
  
  fs.writeFileSync(envPath, envContent);
  log(`✅ Docker env file created: ${envPath}`, 'green');
  
  return envPath;
}

// Create launch script
function createLaunchScript() {
  logSection('4. CREATING LAUNCH SCRIPT');
  
  const launchScriptPath = path.join(__dirname, '..', 'launch-live-test.sh');
  const scriptContent = `#!/bin/bash

# Live Test Launch Script
# Memory-optimized Docker deployment

set -e

echo "🚀 Launching HingeCraft Automation System - Live Test"
echo "=================================================="

# Colors
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
NC='\\033[0m' # No Color

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "\${RED}❌ Docker not found. Please install Docker first.\${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "\${RED}❌ Docker Compose not found. Please install Docker Compose first.\${NC}"
    exit 1
fi

# Load environment
if [ -f .env.docker ]; then
    echo -e "\${GREEN}✅ Loading Docker environment...\${NC}"
    export $(cat .env.docker | grep -v '^#' | xargs)
else
    echo -e "\${YELLOW}⚠️  .env.docker not found. Using defaults.\${NC}"
fi

# Stop existing containers
echo -e "\${YELLOW}🛑 Stopping existing containers...\${NC}"
docker-compose down 2>/dev/null || true

# Build images
echo -e "\${GREEN}🔨 Building Docker images...\${NC}"
docker-compose build --no-cache

# Start services
echo -e "\${GREEN}🚀 Starting services...\${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "\${YELLOW}⏳ Waiting for services to be healthy...\${NC}"
sleep 10

# Check service status
echo -e "\${GREEN}📊 Service Status:\${NC}"
docker-compose ps

# Check memory usage
echo -e "\${GREEN}💾 Memory Usage:\${NC}"
docker stats --no-stream --format "table {{.Container}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.MemPerc}}"

echo ""
echo -e "\${GREEN}✅ System launched successfully!\${NC}"
echo ""
echo "📋 Next Steps:"
echo "   1. Upload test-live-single-email.csv to Google Drive folder"
echo "   2. Run testSingleEmail() in Google Apps Script"
echo "   3. Check email at chandlerferguson319@gmail.com"
echo ""
echo "📊 Monitor:"
echo "   - Logs: docker-compose logs -f"
echo "   - Memory: docker stats"
echo "   - Stop: docker-compose down"
`;
  
  fs.writeFileSync(launchScriptPath, scriptContent);
  fs.chmodSync(launchScriptPath, '755');
  log(`✅ Launch script created: ${launchScriptPath}`, 'green');
  
  return launchScriptPath;
}

// Create qualification script
function createQualificationScript() {
  logSection('5. CREATING QUALIFICATION PROCESS');
  
  const qualPath = path.join(__dirname, '..', 'src/services/qualification.js');
  const qualContent = `/**
 * Lead Qualification Service
 * Determines template set and sequence based on profile
 */

class QualificationService {
  /**
   * Qualify lead and determine template set
   * @param {Object} contact - Contact data
   * @returns {Object} Qualification result
   */
  qualify(contact) {
    const company = (contact.company || contact.properties?.company || '').toLowerCase();
    const title = (contact.title || contact.properties?.jobtitle || '').toLowerCase();
    const website = (contact.website || contact.properties?.website || '').toLowerCase();
    const email = (contact.email || contact.properties?.email || '').toLowerCase();
    
    let leadType = 'B2B';
    let templateSet = 'set_three_b2b';
    let qualificationScore = 0;
    let indicators = [];
    
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
      qualificationScore = 85;
      indicators.push('Student/Education detected');
    }
    
    // Check for NGO
    const hasNgoIndicator = ngoIndicators.some(ind => 
      company.includes(ind) || title.includes(ind) || website.includes(ind)
    );
    
    if (hasNgoIndicator && !hasStudentIndicator) {
      leadType = 'NGO';
      templateSet = 'set_two_referral';
      qualificationScore = 80;
      indicators.push('NGO/Nonprofit detected');
    }
    
    // Check for B2B
    const hasB2bIndicator = b2bIndicators.some(ind => 
      company.includes(ind) || title.includes(ind) || website.includes(ind)
    );
    
    if (hasB2bIndicator && !hasStudentIndicator && !hasNgoIndicator) {
      leadType = 'B2B';
      templateSet = 'set_three_b2b';
      qualificationScore = 75;
      indicators.push('B2B company detected');
    }
    
    // Email domain analysis
    if (email.includes('.edu')) {
      leadType = 'Student';
      templateSet = 'set_one_student';
      qualificationScore = 90;
      indicators.push('Educational email domain (.edu)');
    }
    
    return {
      leadType,
      templateSet,
      qualificationScore,
      indicators,
      qualified: true,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Get sequence steps for template set
   * @param {string} templateSet - Template set name
   * @returns {number} Number of steps
   */
  getSequenceSteps(templateSet) {
    const steps = {
      'set_one_student': 5,
      'set_two_referral': 1,
      'set_three_b2b': 5
    };
    return steps[templateSet] || 5;
  }
}

module.exports = new QualificationService();
`;
  
  // Ensure directory exists
  const dir = path.dirname(qualPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(qualPath, qualContent);
  log(`✅ Qualification service created: ${qualPath}`, 'green');
  
  return qualPath;
}

// Main execution
function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('LIVE TEST SETUP - Single Email Test', 'bright');
  log('='.repeat(80) + '\n', 'cyan');
  
  log(`Test Email: ${TEST_CONFIG.testEmail}`, 'blue');
  log(`From Email: ${TEST_CONFIG.fromEmail}`, 'blue');
  log(`Template Set: ${TEST_CONFIG.qualificationProfile.template_set}`, 'blue');
  
  const testFile = createTestFile();
  const gasConfig = createGASTestConfig();
  const dockerEnv = createDockerEnv();
  const launchScript = createLaunchScript();
  const qualService = createQualificationScript();
  
  logSection('SETUP COMPLETE');
  
  log('\n✅ Files Created:', 'green');
  log(`   1. Test CSV: ${testFile}`, 'green');
  log(`   2. GAS Test Config: ${gasConfig}`, 'green');
  log(`   3. Docker Env: ${dockerEnv}`, 'green');
  log(`   4. Launch Script: ${launchScript}`, 'green');
  log(`   5. Qualification Service: ${qualService}`, 'green');
  
  log('\n📋 Next Steps:', 'cyan');
  log('   1. Review test configuration', 'yellow');
  log('   2. Run: ./launch-live-test.sh', 'yellow');
  log('   3. Upload test CSV to Google Drive', 'yellow');
  log('   4. Run testSingleEmail() in Apps Script', 'yellow');
  log('   5. Check email at chandlerferguson319@gmail.com', 'yellow');
  
  log('\n🎯 System Ready for Live Test!', 'green');
}

main();



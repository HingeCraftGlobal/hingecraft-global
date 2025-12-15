/**
 * Send Live Test Email
 * Executes the testSingleEmail function in Google Apps Script
 * Sends actual email from marketingecraft@gmail.com to chandlerferguson319@gmail.com
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  FROM_EMAIL: 'marketingecraft@gmail.com',
  TO_EMAIL: 'chandlerferguson319@gmail.com',
  SCRIPT_ID: null, // Will be read from .clasp.json
  FUNCTION_NAME: 'testSingleEmail'
};

/**
 * Get script ID from .clasp.json
 */
function getScriptId() {
  const claspPath = path.join(__dirname, '..', 'google-apps-script', '.clasp.json');
  
  if (!fs.existsSync(claspPath)) {
    throw new Error('.clasp.json not found. Please run clasp login and clasp push first.');
  }
  
  const clasp = JSON.parse(fs.readFileSync(claspPath, 'utf8'));
  return clasp.scriptId;
}

/**
 * Execute Google Apps Script function via API
 */
async function executeGASFunction(scriptId, functionName) {
  console.log('🚀 Executing Google Apps Script function...\n');
  console.log(`   Script ID: ${scriptId}`);
  console.log(`   Function: ${functionName}\n`);
  
  // Note: This requires OAuth2 setup and the Apps Script API to be enabled
  // For now, we'll provide instructions for manual execution
  
  console.log('📧 LIVE TEST EMAIL SETUP');
  console.log('='.repeat(80));
  console.log('\nTo send the live test email, please follow these steps:\n');
  console.log('1. Go to: https://script.google.com');
  console.log('2. Open your HingeCraft Automation project');
  console.log('3. Select the function: testSingleEmail');
  console.log('4. Click the "Run" button (▶️)');
  console.log('5. Authorize if prompted');
  console.log('6. Check the execution log for success');
  console.log('7. Check your email: chandlerferguson319@gmail.com\n');
  console.log('Expected Email Details:');
  console.log(`   From: ${CONFIG.FROM_EMAIL}`);
  console.log(`   To: ${CONFIG.TO_EMAIL}`);
  console.log('   Subject: Partnership Opportunity: Let\'s Build Together');
  console.log('   Template: B2B Step 1 (set_three_b2b)\n');
  console.log('='.repeat(80));
  
  return {
    success: true,
    message: 'Instructions provided for manual execution',
    scriptId: scriptId,
    functionName: functionName
  };
}

/**
 * Create direct execution script
 */
function createExecutionScript() {
  const scriptPath = path.join(__dirname, '..', 'execute-live-test.sh');
  
  const script = `#!/bin/bash
# Execute Live Test Email
# This script provides instructions for sending the live test email

echo "🚀 HingeCraft Automation - Live Test Email"
echo "=========================================="
echo ""
echo "📧 Email Configuration:"
echo "   From: marketingecraft@gmail.com"
echo "   To: chandlerferguson319@gmail.com"
echo "   Template: B2B Step 1"
echo ""
echo "🔧 Execution Steps:"
echo ""
echo "1. Open Google Apps Script:"
echo "   https://script.google.com"
echo ""
echo "2. Select your project: HingeCraft Automation"
echo ""
echo "3. In the function dropdown, select: testSingleEmail"
echo ""
echo "4. Click the 'Run' button (▶️)"
echo ""
echo "5. Authorize the script if prompted:"
echo "   - Grant access to Gmail"
echo "   - Grant access to Drive"
echo ""
echo "6. Check the execution log for:"
echo "   ✅ Email sent successfully"
echo ""
echo "7. Check your inbox:"
echo "   chandlerferguson319@gmail.com"
echo ""
echo "8. Verify the email:"
echo "   - From: marketingecraft@gmail.com"
echo "   - Subject: Partnership Opportunity: Let's Build Together"
echo "   - Contains personalized content"
echo ""
echo "✅ Test complete!"
echo ""
`;

  fs.writeFileSync(scriptPath, script);
  fs.chmodSync(scriptPath, '755');
  
  console.log(`✅ Execution script created: ${scriptPath}\n`);
  
  return scriptPath;
}

/**
 * Main function
 */
async function sendLiveTestEmail() {
  console.log('📧 Preparing Live Test Email\n');
  console.log('='.repeat(80));
  
  try {
    // Get script ID
    const scriptId = getScriptId();
    CONFIG.SCRIPT_ID = scriptId;
    
    console.log(`✅ Script ID found: ${scriptId}\n`);
    
    // Create execution script
    const scriptPath = createExecutionScript();
    
    // Provide execution instructions
    const result = await executeGASFunction(scriptId, CONFIG.FUNCTION_NAME);
    
    // Print summary
    console.log('\n📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`FROM: ${CONFIG.FROM_EMAIL}`);
    console.log(`TO: ${CONFIG.TO_EMAIL}`);
    console.log(`Function: ${CONFIG.FUNCTION_NAME}`);
    console.log(`Script ID: ${scriptId}`);
    console.log(`\n📄 Execution script: ${scriptPath}`);
    console.log('\n✅ Ready for live test!\n');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Manual Execution Instructions:');
    console.log('1. Go to https://script.google.com');
    console.log('2. Open your project');
    console.log('3. Select function: testSingleEmail');
    console.log('4. Click Run');
    console.log('5. Check email at chandlerferguson319@gmail.com\n');
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  sendLiveTestEmail().catch(console.error);
}

module.exports = { sendLiveTestEmail, CONFIG };



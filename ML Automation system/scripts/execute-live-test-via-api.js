/**
 * Execute Live Test Email via Google Apps Script API
 * This script uses the Apps Script API to execute the testSingleEmail function
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG = {
  FROM_EMAIL: 'marketingecraft@gmail.com',
  TO_EMAIL: 'chandlerferguson319@gmail.com',
  SCRIPT_ID: null,
  FUNCTION_NAME: 'testSingleEmail',
  SCOPES: [
    'https://www.googleapis.com/auth/script.scriptapp',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/drive.readonly'
  ]
};

/**
 * Get script ID from .clasp.json
 */
function getScriptId() {
  const claspPath = path.join(__dirname, '..', 'google-apps-script', '.clasp.json');
  
  if (!fs.existsSync(claspPath)) {
    throw new Error('.clasp.json not found');
  }
  
  const clasp = JSON.parse(fs.readFileSync(claspPath, 'utf8'));
  return clasp.scriptId;
}

/**
 * Get OAuth2 client
 */
async function getOAuth2Client() {
  const credentialsPath = path.join(__dirname, '..', 'credentials.json');
  const tokenPath = path.join(__dirname, '..', 'token.json');
  
  if (!fs.existsSync(credentialsPath)) {
    console.log('⚠️ credentials.json not found.');
    console.log('📝 Setting up OAuth2...\n');
    console.log('For automated execution, you need to:');
    console.log('1. Enable Apps Script API in Google Cloud Console');
    console.log('2. Create OAuth2 credentials');
    console.log('3. Save as credentials.json\n');
    console.log('For now, please execute manually via Apps Script UI.\n');
    return null;
  }
  
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  
  // Check if we have a stored token
  if (fs.existsSync(tokenPath)) {
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }
  
  // Get new token
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: CONFIG.SCOPES
  });
  
  console.log('🔐 Authorization required');
  console.log('Visit this URL to authorize:');
  console.log(authUrl);
  console.log('\nAfter authorization, paste the code here:');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve, reject) => {
    rl.question('Enter code: ', (code) => {
      rl.close();
      
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          reject(err);
          return;
        }
        
        oAuth2Client.setCredentials(token);
        fs.writeFileSync(tokenPath, JSON.stringify(token));
        resolve(oAuth2Client);
      });
    });
  });
}

/**
 * Execute function via Apps Script API
 */
async function executeFunction(auth, scriptId, functionName) {
  const script = google.script('v1');
  
  try {
    console.log(`🚀 Executing function: ${functionName}...\n`);
    
    const response = await script.scripts.run({
      auth: auth,
      scriptId: scriptId,
      requestBody: {
        function: functionName
      }
    });
    
    if (response.data.error) {
      throw new Error(JSON.stringify(response.data.error));
    }
    
    return response.data;
    
  } catch (error) {
    throw error;
  }
}

/**
 * Main execution
 */
async function executeLiveTest() {
  console.log('📧 Live Test Email Execution\n');
  console.log('='.repeat(80));
  
  try {
    // Get script ID
    CONFIG.SCRIPT_ID = getScriptId();
    console.log(`✅ Script ID: ${CONFIG.SCRIPT_ID}\n`);
    
    // Get OAuth2 client
    const auth = await getOAuth2Client();
    
    if (!auth) {
      // Fallback to manual instructions
      console.log('📝 MANUAL EXECUTION INSTRUCTIONS');
      console.log('='.repeat(80));
      console.log('\n1. Go to: https://script.google.com');
      console.log('2. Open your HingeCraft Automation project');
      console.log('3. Select function: testSingleEmail');
      console.log('4. Click "Run" (▶️)');
      console.log('5. Authorize if prompted');
      console.log('6. Check email: chandlerferguson319@gmail.com\n');
      return;
    }
    
    // Execute function
    const result = await executeFunction(auth, CONFIG.SCRIPT_ID, CONFIG.FUNCTION_NAME);
    
    console.log('✅ Function executed successfully!\n');
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('\n📧 Check your email: chandlerferguson319@gmail.com');
    console.log(`   From: ${CONFIG.FROM_EMAIL}`);
    console.log('   Subject: Partnership Opportunity: Let\'s Build Together\n');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please execute manually via Apps Script UI\n');
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  executeLiveTest().catch(console.error);
}

module.exports = { executeLiveTest, CONFIG };



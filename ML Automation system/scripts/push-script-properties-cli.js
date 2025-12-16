#!/usr/bin/env node

/**
 * Push Script Properties via CLI
 * 
 * Sets Script Properties in Google Apps Script using Apps Script API
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Try to load .env if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed
}

const SCRIPT_ID = process.env.APPS_SCRIPT_ID || 'AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4';

// Script Properties from this chat session
const SCRIPT_PROPERTIES = {
  // Required
  'HUBSPOT_TOKEN': process.env.HUBSPOT_TOKEN || '',
  'ANYMAIL_API_KEY': process.env.ANYMAIL_API_KEY || '',
  'MONITORED_FOLDER_ID': process.env.MONITORED_FOLDER_ID || '',
  'GMAIL_FROM_ADDRESS': process.env.GMAIL_FROM_ADDRESS || 'marketingecraft@gmail.com',
  
  // Tracking (GA4)
  'TRACKING_ENDPOINT_URL': 'https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec',
  'GA4_MEASUREMENT_ID': 'G-QF5H2Q291T',
  'GA4_API_SECRET': 'cJH76-IHQteQx6DKaiPkGA',
  'GA4_STREAM_ID': '13142410458',
  'GA4_STREAM_URL': 'https://hingecraft-global.ai'
};

async function authenticate() {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || 
                  path.join(__dirname, '../config/service-account-key.json');
  
  if (!fs.existsSync(keyFile)) {
    console.log('⚠️  Service account key not found. Script Properties must be set manually.\n');
    console.log('📝 Manual Setup Instructions:');
    console.log('1. Go to: https://script.google.com');
    console.log('2. Open your project');
    console.log('3. Go to: Project Settings → Script Properties');
    console.log('4. Add these properties:\n');
    
    Object.entries(SCRIPT_PROPERTIES).forEach(([key, value]) => {
      if (value) {
        console.log(`   ${key}: ${value}`);
      } else {
        console.log(`   ${key}: [REQUIRED - Set this value]`);
      }
    });
    console.log('');
    return null;
  }
  
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFile,
      scopes: [
        'https://www.googleapis.com/auth/script.projects',
        'https://www.googleapis.com/auth/script.scriptapp'
      ]
    });
    
    return await auth.getClient();
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return null;
  }
}

async function setScriptProperties(auth) {
  const script = google.script('v1');
  
  console.log('📝 Setting Script Properties...\n');
  
  // Note: Apps Script API doesn't directly support setting Script Properties
  // We need to use the Apps Script API to update the script content
  // OR provide instructions for manual setup
  
  console.log('⚠️  Apps Script API does not support setting Script Properties directly.');
  console.log('📝 Properties must be set manually in the Apps Script UI.\n');
  
  console.log('🔗 Direct Link:');
  console.log(`   https://script.google.com/home/projects/${SCRIPT_ID}/settings\n`);
  
  console.log('📋 Properties to Add:\n');
  Object.entries(SCRIPT_PROPERTIES).forEach(([key, value]) => {
    if (value) {
      console.log(`   ${key}: ${value}`);
    } else {
      console.log(`   ${key}: [REQUIRED - Set this value]`);
    }
  });
  
  console.log('\n✅ After adding, the system will automatically use them.\n');
  
  // Save properties to a file for reference
  const propsFile = path.join(__dirname, '../script-properties-reference.json');
  fs.writeFileSync(propsFile, JSON.stringify(SCRIPT_PROPERTIES, null, 2));
  console.log('📄 Properties saved to:', propsFile);
  console.log('   (Use this as a reference when setting properties manually)\n');
  
  return true;
}

async function main() {
  console.log('📝 Push Script Properties via CLI\n');
  console.log('='.repeat(60) + '\n');
  
  const auth = await authenticate();
  
  if (auth) {
    await setScriptProperties(auth);
  } else {
    await setScriptProperties(null);
  }
  
  console.log('🎯 Next Steps:');
  console.log('1. Add Script Properties manually (see above)');
  console.log('2. Verify trigger is configured');
  console.log('3. Test email send\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setScriptProperties, SCRIPT_PROPERTIES };

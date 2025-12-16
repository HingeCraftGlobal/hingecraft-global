#!/usr/bin/env node

/**
 * Set Script Properties via CLI
 * 
 * Attempts to set Script Properties using Apps Script API
 * Falls back to manual instructions if API doesn't support it
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to load .env if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed
}

const SCRIPT_ID = process.env.APPS_SCRIPT_ID || 'AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4';

// Script Properties from chat session
const SCRIPT_PROPERTIES = {
  // Required - Get from environment or prompt
  'HUBSPOT_TOKEN': process.env.HUBSPOT_TOKEN || '',
  'ANYMAIL_API_KEY': process.env.ANYMAIL_API_KEY || '',
  'MONITORED_FOLDER_ID': process.env.MONITORED_FOLDER_ID || '',
  'GMAIL_FROM_ADDRESS': process.env.GMAIL_FROM_ADDRESS || 'marketingecraft@gmail.com',
  
  // Tracking (GA4) - Fixed values
  'TRACKING_ENDPOINT_URL': 'https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec',
  'GA4_MEASUREMENT_ID': 'G-QF5H2Q291T',
  'GA4_API_SECRET': 'cJH76-IHQteQx6DKaiPkGA',
  'GA4_STREAM_ID': '13142410458',
  'GA4_STREAM_URL': 'https://hingecraft-global.ai'
};

function generateClaspScript() {
  console.log('📝 Generating clasp script to set properties...\n');
  
  // Create a temporary Apps Script file that sets properties
  const tempScript = `
// Temporary script to set Script Properties
// Run this once, then delete

function setAllScriptProperties() {
  const properties = PropertiesService.getScriptProperties();
  
  const props = ${JSON.stringify(SCRIPT_PROPERTIES, null, 2)};
  
  Object.entries(props).forEach(([key, value]) => {
    if (value) {
      properties.setProperty(key, value);
      Logger.log(\`✅ Set: \${key}\`);
    } else {
      Logger.log(\`⚠️  Skipped: \${key} (empty value)\`);
    }
  });
  
  Logger.log('✅ All Script Properties set!');
}
`;
  
  const tempFile = path.join(__dirname, '../google-apps-script/TEMP_SET_PROPERTIES.gs');
  
  // Check if google-apps-script directory exists
  const scriptDir = path.join(__dirname, '../google-apps-script');
  if (!fs.existsSync(scriptDir)) {
    console.log('⚠️  google-apps-script directory not found');
    console.log('   Creating temporary directory...\n');
    fs.mkdirSync(scriptDir, { recursive: true });
  }
  
  fs.writeFileSync(tempFile, tempScript);
  console.log('✅ Created temporary script:', tempFile);
  console.log('');
  
  return tempFile;
}

function pushViaClasp() {
  console.log('📤 Attempting to push via clasp...\n');
  
  const scriptDir = path.join(__dirname, '../google-apps-script');
  
  if (!fs.existsSync(scriptDir)) {
    console.log('❌ google-apps-script directory not found');
    return false;
  }
  
  try {
    process.chdir(scriptDir);
    
    // Check if .clasp.json exists
    if (!fs.existsSync('.clasp.json')) {
      console.log('⚠️  .clasp.json not found');
      console.log('   Creating .clasp.json...\n');
      
      const claspConfig = {
        scriptId: SCRIPT_ID,
        rootDir: '.'
      };
      
      fs.writeFileSync('.clasp.json', JSON.stringify(claspConfig, null, 2));
      console.log('✅ Created .clasp.json\n');
    }
    
    console.log('Running: clasp push --force');
    const output = execSync('clasp push --force', { encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
    console.log('✅ Code pushed successfully\n');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to push via clasp:', error.message);
    console.log('⚠️  Will provide manual instructions\n');
    return false;
  }
}

function provideManualInstructions() {
  console.log('📝 Manual Setup Instructions\n');
  console.log('='.repeat(60) + '\n');
  
  console.log('⚠️  Apps Script API does not support setting Script Properties directly.');
  console.log('📝 Properties must be set manually in the Apps Script UI.\n');
  
  console.log('🔗 Direct Link:');
  console.log(`   https://script.google.com/home/projects/${SCRIPT_ID}/settings\n`);
  
  console.log('📋 Step-by-Step Instructions:\n');
  console.log('1. Go to: https://script.google.com');
  console.log('2. Open your project (Script ID: ' + SCRIPT_ID + ')');
  console.log('3. Click: Project Settings (⚙️ icon)');
  console.log('4. Scroll to: Script Properties');
  console.log('5. Click: Add script property (for each property below)\n');
  
  console.log('📋 Properties to Add:\n');
  
  const required = [];
  const optional = [];
  
  Object.entries(SCRIPT_PROPERTIES).forEach(([key, value]) => {
    if (['HUBSPOT_TOKEN', 'ANYMAIL_API_KEY', 'MONITORED_FOLDER_ID', 'GMAIL_FROM_ADDRESS'].includes(key)) {
      required.push({ key, value });
    } else {
      optional.push({ key, value });
    }
  });
  
  console.log('Required Properties:\n');
  required.forEach(prop => {
    if (prop.value) {
      console.log(`   ${prop.key}: ${prop.value}`);
    } else {
      console.log(`   ${prop.key}: [REQUIRED - Set this value]`);
    }
  });
  
  console.log('\nTracking Properties (GA4):\n');
  optional.forEach(prop => {
    console.log(`   ${prop.key}: ${prop.value}`);
  });
  
  console.log('\n✅ After adding all properties, the system will automatically use them.\n');
}

function createPropertySetterScript() {
  console.log('📝 Creating property setter script for Apps Script...\n');
  
  const scriptContent = `/**
 * Set All Script Properties
 * 
 * Run this function ONCE in Apps Script to set all properties
 * Then delete this function
 */
function setAllScriptProperties() {
  const properties = PropertiesService.getScriptProperties();
  
  const props = ${JSON.stringify(SCRIPT_PROPERTIES, null, 2)};
  
  let set = 0;
  let skipped = 0;
  
  Object.entries(props).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      properties.setProperty(key, value);
      Logger.log(\`✅ Set: \${key}\`);
      set++;
    } else {
      Logger.log(\`⚠️  Skipped: \${key} (empty value - set manually)\`);
      skipped++;
    }
  });
  
  Logger.log(\`\\n✅ Complete: \${set} properties set, \${skipped} skipped\`);
  Logger.log('⚠️  Properties with empty values must be set manually');
}
`;
  
  const outputFile = path.join(__dirname, '../SET_PROPERTIES_SCRIPT.gs');
  fs.writeFileSync(outputFile, scriptContent);
  
  console.log('✅ Created Apps Script function file:');
  console.log(`   ${outputFile}\n`);
  console.log('📋 To use this:');
  console.log('1. Copy the contents of SET_PROPERTIES_SCRIPT.gs');
  console.log('2. Paste into Apps Script editor');
  console.log('3. Run the function: setAllScriptProperties');
  console.log('4. Check execution log for results');
  console.log('5. Delete the function after use\n');
  
  return outputFile;
}

async function main() {
  console.log('📝 Set Script Properties via CLI\n');
  console.log('='.repeat(60) + '\n');
  
  // Method 1: Try to create Apps Script function
  const scriptFile = createPropertySetterScript();
  
  // Method 2: Try clasp push (if directory exists)
  const scriptDir = path.join(__dirname, '../google-apps-script');
  if (fs.existsSync(scriptDir)) {
    const tempFile = generateClaspScript();
    const pushed = pushViaClasp();
    
    if (pushed) {
      console.log('✅ Code pushed! Now:');
      console.log('1. Go to Apps Script editor');
      console.log('2. Run function: setAllScriptProperties');
      console.log('3. Check execution log');
      console.log('4. Delete TEMP_SET_PROPERTIES.gs\n');
    }
  }
  
  // Method 3: Provide manual instructions
  provideManualInstructions();
  
  // Save reference
  const refFile = path.join(__dirname, '../script-properties-reference.json');
  fs.writeFileSync(refFile, JSON.stringify(SCRIPT_PROPERTIES, null, 2));
  console.log('📄 Properties reference saved to:', refFile + '\n');
  
  console.log('🎯 Recommended Approach:');
  console.log('1. Use SET_PROPERTIES_SCRIPT.gs (copy to Apps Script)');
  console.log('2. Or set manually in Apps Script UI');
  console.log('3. Verify all properties are set\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setScriptProperties: main, SCRIPT_PROPERTIES };

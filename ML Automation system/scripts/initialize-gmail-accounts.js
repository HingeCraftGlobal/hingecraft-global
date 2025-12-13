#!/usr/bin/env node

/**
 * Initialize Both Gmail Accounts
 * Sets up OAuth for departments@hingecraft-global.ai and marketingecraft@gmail.com
 */

const gmailMultiAccount = require('../src/services/gmailMultiAccount');
const logger = require('../src/utils/logger');

async function initializeGmailAccounts() {
  try {
    console.log('\n🚀 GMAIL MULTI-ACCOUNT SETUP');
    console.log('='.repeat(70));
    console.log('');

    // Get auth URLs for both accounts
    console.log('📋 Step 1: Getting authorization URLs...');
    const departmentsUrl = gmailMultiAccount.getAuthUrl('departments@hingecraft-global.ai');
    const marketingUrl = gmailMultiAccount.getAuthUrl('marketingecraft@gmail.com');

    console.log('');
    console.log('🔐 AUTHORIZATION REQUIRED');
    console.log('');
    console.log('1. Departments Account (departments@hingecraft-global.ai):');
    console.log(`   ${departmentsUrl}`);
    console.log('');
    console.log('2. Marketing Account (marketingecraft@gmail.com):');
    console.log(`   ${marketingUrl}`);
    console.log('');
    console.log('📋 Instructions:');
    console.log('   1. Visit each URL above');
    console.log('   2. Authorize all requested permissions');
    console.log('   3. Copy the authorization code from the redirect');
    console.log('   4. Run: node scripts/complete-oauth.js <account> <code>');
    console.log('');
    console.log('✅ Once both accounts are authorized, the system will automatically');
    console.log('   select the appropriate account based on lead type.');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  initializeGmailAccounts();
}

module.exports = initializeGmailAccounts;

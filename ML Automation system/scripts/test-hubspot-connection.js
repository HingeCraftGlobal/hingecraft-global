#!/usr/bin/env node

/**
 * Test HubSpot API Connection
 * Verifies the Personal Access Key is valid
 */

const axios = require('axios');
const config = require('../config/api_keys');

async function testConnection() {
  try {
    const apiKey = config.hubspot.personalAccessKey || config.hubspot.apiKey;
    
    if (!apiKey) {
      console.error('❌ No API key found in config');
      return;
    }

    console.log('\n🔐 TESTING HUBSPOT API CONNECTION');
    console.log('='.repeat(70));
    console.log(`Using: ${apiKey.substring(0, 20)}...`);
    console.log('');

    // Test 1: Get contacts
    console.log('📋 Test 1: Fetching contacts...');
    const contactsResult = await axios.get(
      'https://api.hubapi.com/crm/v3/objects/contacts?limit=1',
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Contacts API: SUCCESS (Status: ${contactsResult.status})`);
    console.log(`   Found ${contactsResult.data.results?.length || 0} contacts`);
    console.log('');

    // Test 2: Get account info
    console.log('📋 Test 2: Fetching account info...');
    try {
      const accountResult = await axios.get(
        'https://api.hubapi.com/integrations/v1/me',
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Account API: SUCCESS`);
      console.log(`   Portal ID: ${accountResult.data.portalId || 'N/A'}`);
      console.log('');
    } catch (e) {
      console.log(`⚠️  Account API: ${e.response?.status || 'Failed'}`);
      console.log('');
    }

    // Test 3: Check properties
    console.log('📋 Test 3: Checking contact properties...');
    try {
      const propsResult = await axios.get(
        'https://api.hubapi.com/crm/v3/properties/contacts',
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Properties API: SUCCESS`);
      console.log(`   Found ${propsResult.data.results?.length || 0} properties`);
      console.log('');
    } catch (e) {
      console.log(`⚠️  Properties API: ${e.response?.status || 'Failed'}`);
      console.log('');
    }

    console.log('='.repeat(70));
    console.log('✅ API CONNECTION: VALID');
    console.log('');
    console.log('🚀 Ready to sync! Run:');
    console.log('   node scripts/hubspot-full-sync.js');
    console.log('');

  } catch (error) {
    console.log('='.repeat(70));
    console.log('❌ API CONNECTION: FAILED');
    console.log('');
    console.log(`Status: ${error.response?.status || 'Unknown'}`);
    console.log(`Message: ${error.response?.data?.message || error.message}`);
    console.log('');
    
    if (error.response?.status === 401) {
      console.log('⚠️  The Personal Access Key is invalid or expired.');
      console.log('');
      console.log('📋 To Fix:');
      console.log('   1. Generate new key: hs auth personal-access-key');
      console.log('   2. Update config/api_keys.js');
      console.log('   3. Re-run this test');
      console.log('');
    }
    
    process.exit(1);
  }
}

testConnection();

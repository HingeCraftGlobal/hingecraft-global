#!/usr/bin/env node
/**
 * Verify OAuth Client Secret
 * Compares the client secret in code with what's expected
 */

const config = require('../../config/api_keys');

console.log('\n🔍 OAuth Client Configuration Verification\n');
console.log('═'.repeat(60));

console.log('\n📋 Current Configuration:');
console.log(`   Client ID: ${config.google.clientId}`);
console.log(`   Client ID (short): ${config.google.clientId.replace('.apps.googleusercontent.com', '')}`);
console.log(`   Client Secret: ${config.google.clientSecret ? '***SET*** (' + config.google.clientSecret.length + ' chars)' : '❌ MISSING'}`);

console.log('\n✅ Verification Steps:');
console.log('   1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('   2. Find OAuth client: 590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej');
console.log('   3. Click "Edit"');
console.log('   4. Check "Client secret" section');
console.log('   5. If you see "Reset secret", the secret may have changed');
console.log('   6. Compare the secret shown with what\'s in config/api_keys.js');

console.log('\n⚠️  If Client Secret Doesn\'t Match:');
console.log('   Option A: Reset secret in Google Cloud Console');
console.log('     1. Click "Reset secret" in Google Cloud Console');
console.log('     2. Copy the new secret');
console.log('     3. Update config/api_keys.js');
console.log('     4. Restart Docker: docker-compose restart automation');
console.log('');
console.log('   Option B: Update code with existing secret');
console.log('     1. Copy the secret from Google Cloud Console');
console.log('     2. Update config/api_keys.js');
console.log('     3. Restart Docker: docker-compose restart automation');

console.log('\n🔗 Quick Links:');
console.log('   OAuth Credentials: https://console.cloud.google.com/apis/credentials');
console.log('   OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent');

console.log('\n' + '═'.repeat(60) + '\n');

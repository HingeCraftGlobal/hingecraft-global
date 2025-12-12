#!/usr/bin/env node

/**
 * Complete Setup Verification Script
 * Verifies all Google Cloud Platform scopes, APIs, and system components
 */

const config = require('../config/api_keys');
const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:7101';

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark(passed) {
  return passed ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
}

async function checkAPIHealth() {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function checkOAuthStatus() {
  try {
    const response = await axios.get(`${API_BASE}/auth/status`);
    return response.data;
  } catch (error) {
    return { authorized: false, error: error.message };
  }
}

async function checkPipelineStatus() {
  try {
    const response = await axios.get(`${API_BASE}/api/pipeline/status`);
    return response.data;
  } catch (error) {
    return { error: error.message };
  }
}

function verifyScopes() {
  const requiredScopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.metadata',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ];

  const configuredScopes = config.google.scopes || [];
  const missingScopes = requiredScopes.filter(scope => !configuredScopes.includes(scope));

  return {
    allPresent: missingScopes.length === 0,
    missing: missingScopes,
    configured: configuredScopes
  };
}

async function main() {
  log('\n═══════════════════════════════════════════════════════', 'cyan');
  log('🔍 COMPLETE SETUP VERIFICATION', 'bright');
  log('═══════════════════════════════════════════════════════\n', 'cyan');

  // 1. API Health Check
  log('1️⃣  API Health Check', 'blue');
  const apiHealthy = await checkAPIHealth();
  log(`   ${checkmark(apiHealthy)} API is ${apiHealthy ? 'healthy' : 'unreachable'}`);
  if (!apiHealthy) {
    log('   ⚠️  Cannot proceed with other checks - API is down', 'yellow');
    process.exit(1);
  }

  // 2. OAuth Scopes Verification
  log('\n2️⃣  OAuth Scopes Verification', 'blue');
  const scopeCheck = verifyScopes();
  log(`   ${checkmark(scopeCheck.allPresent)} All required scopes configured`);
  if (!scopeCheck.allPresent) {
    log('   ⚠️  Missing scopes:', 'yellow');
    scopeCheck.missing.forEach(scope => {
      log(`      - ${scope}`, 'yellow');
    });
  } else {
    log('   ✅ All 7 required scopes present:', 'green');
    scopeCheck.configured.forEach(scope => {
      log(`      ✓ ${scope}`, 'green');
    });
  }

  // 3. OAuth Status
  log('\n3️⃣  OAuth Authorization Status', 'blue');
  const oauthStatus = await checkOAuthStatus();
  log(`   ${checkmark(oauthStatus.authorized)} OAuth authorized: ${oauthStatus.authorized}`);
  log(`   ${checkmark(oauthStatus.hasRefreshToken)} Has refresh token: ${oauthStatus.hasRefreshToken || false}`);
  if (!oauthStatus.authorized) {
    log('   ⚠️  OAuth not completed - visit http://localhost:7101/auth/google', 'yellow');
  }

  // 4. System Components
  log('\n4️⃣  System Components', 'blue');
  const pipelineStatus = await checkPipelineStatus();
  log(`   ${checkmark(pipelineStatus.watcherActive)} System watcher: ${pipelineStatus.watcherActive ? 'active' : 'inactive'}`);
  log(`   ${checkmark(pipelineStatus.mode === 'standby' || pipelineStatus.mode === 'active')} Mode: ${pipelineStatus.mode || 'unknown'}`);

  // 5. Required APIs (Manual Check)
  log('\n5️⃣  Google Cloud Platform APIs', 'blue');
  log('   ⚠️  Manual verification required:', 'yellow');
  log('      Visit: https://console.cloud.google.com/apis/library', 'yellow');
  log('      Required APIs:', 'yellow');
  log('      ✓ Gmail API', 'yellow');
  log('      ✓ Google Sheets API', 'yellow');
  log('      ✓ Google Drive API', 'yellow');
  log('      ✓ People API', 'yellow');
  log('      ✓ Cloud Resource Manager API', 'yellow');

  // 6. Summary
  log('\n═══════════════════════════════════════════════════════', 'cyan');
  log('📊 VERIFICATION SUMMARY', 'bright');
  log('═══════════════════════════════════════════════════════\n', 'cyan');

  const allScopesPresent = scopeCheck.allPresent;
  const oauthComplete = oauthStatus.authorized && oauthStatus.hasRefreshToken;
  const systemReady = pipelineStatus.watcherActive;

  log(`Scopes:     ${checkmark(allScopesPresent)} ${allScopesPresent ? 'All configured' : 'Missing scopes'}`);
  log(`OAuth:      ${checkmark(oauthComplete)} ${oauthComplete ? 'Authorized' : 'Needs authorization'}`);
  log(`System:     ${checkmark(systemReady)} ${systemReady ? 'Ready' : 'Not ready'}`);

  if (allScopesPresent && oauthComplete && systemReady) {
    log('\n✅ SYSTEM IS FULLY OPERATIONAL!', 'green');
  } else {
    log('\n⚠️  SYSTEM NEEDS CONFIGURATION', 'yellow');
    if (!allScopesPresent) {
      log('   - Update scopes in config/api_keys.js', 'yellow');
    }
    if (!oauthComplete) {
      log('   - Complete OAuth: http://localhost:7101/auth/google', 'yellow');
    }
    if (!systemReady) {
      log('   - Check system watcher status', 'yellow');
    }
  }

  log('\n');
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});


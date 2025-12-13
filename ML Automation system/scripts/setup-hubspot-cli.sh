#!/bin/bash

# HubSpot CLI Setup Script
# Configures HubSpot CLI and syncs all data

set -e

echo "🚀 HUBSPOT CLI SETUP & SYNC"
echo "============================"
echo ""

# Personal Access Key
PERSONAL_ACCESS_KEY="CiRuYTItM2E3Mi03NjE2LTQ4MzUtOTE3Yi0wN2QxNTM0ZDlkZWQQ2ujOdBjwnoUpKhkABeaRgnnnv3MnYXmsIUwQoUDierI5Ksb4SgNuYTI"

echo "📋 Step 1: Authenticating with HubSpot CLI..."
echo "$PERSONAL_ACCESS_KEY" | npx @hubspot/cli auth personal-access-key --personal-access-key-stdin || {
    echo "⚠️  CLI auth failed, using direct API key in config"
}

echo ""
echo "📋 Step 2: Testing API connection..."
DB_HOST=localhost DB_PORT=7543 node -e "
const axios = require('axios');
const config = require('./config/api_keys');
const apiKey = config.hubspot.personalAccessKey || config.hubspot.apiKey;
axios.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
  headers: {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json'
  }
}).then(r => {
  console.log('✅ API Connection: SUCCESS');
  console.log('   Status:', r.status);
}).catch(e => {
  console.log('❌ API Connection: FAILED');
  console.log('   Status:', e.response?.status);
  console.log('   Message:', e.response?.data?.message || e.message);
  console.log('');
  console.log('⚠️  The Personal Access Key may be expired.');
  console.log('   You may need to generate a new one from HubSpot.');
  process.exit(1);
});
"

echo ""
echo "📋 Step 3: Syncing all data to HubSpot..."
DB_HOST=localhost DB_PORT=7543 node scripts/sync-to-hubspot.js || {
    echo ""
    echo "⚠️  Full sync failed, trying contact properties only..."
    DB_HOST=localhost DB_PORT=7543 node scripts/sync-contacts-only.js
}

echo ""
echo "✅ Setup Complete!"
echo ""

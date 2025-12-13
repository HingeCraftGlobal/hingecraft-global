#!/bin/bash

# HubSpot CLI Sync Script
# Syncs all data to HubSpot using CLI and API

set -e

export DB_HOST=localhost
export DB_PORT=7543

echo "🚀 HUBSPOT CLI SYNC"
echo "==================="
echo ""

# Check if HubSpot CLI is installed
if ! command -v hs &> /dev/null; then
    echo "⚠️  HubSpot CLI not found. Installing..."
    npm install -g @hubspot/cli
fi

# Authenticate with HubSpot CLI
echo "📋 Step 1: Authenticating with HubSpot CLI..."
if [ -z "$HUBSPOT_API_KEY" ]; then
    echo "⚠️  HUBSPOT_API_KEY not set. Using config file..."
    # Use API key from config
    node -e "const c=require('./config/api_keys');console.log(c.hubspot.personalAccessKey);" | head -1 > /tmp/hubspot_key.txt
    export HUBSPOT_API_KEY=$(cat /tmp/hubspot_key.txt)
fi

# Test API connection
echo ""
echo "📋 Step 2: Testing HubSpot API connection..."
node -e "
const axios = require('axios');
const config = require('./config/api_keys');
const apiKey = config.hubspot.personalAccessKey;
axios.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
  headers: { 'Authorization': 'Bearer ' + apiKey }
}).then(r => {
  console.log('✅ HubSpot API: Connected');
  process.exit(0);
}).catch(e => {
  console.error('❌ HubSpot API: Failed');
  process.exit(1);
});
" || exit 1

# Run complete unified sync
echo ""
echo "📋 Step 3: Running complete unified sync..."
DB_HOST=localhost DB_PORT=7543 node scripts/complete-unified-sync.js

echo ""
echo "✅ HubSpot CLI Sync Complete!"
echo ""

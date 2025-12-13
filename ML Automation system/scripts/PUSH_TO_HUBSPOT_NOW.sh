#!/bin/bash
# PUSH FULL AUTOMATION TO HUBSPOT - LIVE
set -e
export DB_HOST=localhost
export DB_PORT=7543
echo "🚀 PUSHING FULL AUTOMATION TO HUBSPOT - LIVE"
echo "============================================"
echo ""
echo "📋 Testing API connection..."
node -e "const axios=require('axios');const c=require('./config/api_keys');const k=c.hubspot.personalAccessKey||c.hubspot.apiKey;axios.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=1',{headers:{'Authorization':'Bearer '+k}}).then(r=>{console.log('✅ API Connection: VALID');process.exit(0);}).catch(e=>{console.error('❌ API Connection: FAILED');console.error('Status:',e.response?.status);console.error('Message:',e.response?.data?.message||e.message);console.error('');console.error('⚠️  Get new key: https://app-na2.hubspot.com/settings/integrations/private-apps');process.exit(1);});"
[ $? -eq 0 ] || exit 1
echo ""
echo "📋 Pushing all data to HubSpot..."
DB_HOST=localhost DB_PORT=7543 node scripts/push-to-hubspot-live.js

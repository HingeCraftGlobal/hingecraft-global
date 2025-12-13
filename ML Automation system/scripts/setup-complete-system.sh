#!/bin/bash

# Complete System Setup Script
# Sets up everything needed for full pipeline operation

set -e

export DB_HOST=localhost
export DB_PORT=7543

echo "🚀 COMPLETE SYSTEM SETUP"
echo "========================"
echo ""

# Step 1: Verify HubSpot connection
echo "📋 Step 1: Verifying HubSpot connection..."
node -e "const axios=require('axios');const c=require('./config/api_keys');const k=c.hubspot.personalAccessKey;axios.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=1',{headers:{'Authorization':'Bearer '+k}}).then(r=>console.log('✅ HubSpot: Connected')).catch(e=>{console.error('❌ HubSpot: Failed');process.exit(1);});"
[ $? -eq 0 ] || exit 1

# Step 2: Sync all data to HubSpot
echo ""
echo "📋 Step 2: Syncing all database data to HubSpot..."
DB_HOST=localhost DB_PORT=7543 node scripts/push-to-hubspot-live.js

# Step 3: Verify OAuth
echo ""
echo "📋 Step 3: Checking Google OAuth..."
OAUTH_STATUS=$(curl -s http://localhost:7101/auth/status 2>/dev/null | grep -o '"authenticated":[^,]*' | cut -d: -f2 || echo "false")
if [ "$OAUTH_STATUS" = "true" ]; then
    echo "✅ Google OAuth: Authenticated"
else
    echo "⚠️  Google OAuth: Not authenticated"
    echo "   Visit: http://localhost:7101/auth/google"
fi

# Step 4: Initialize templates
echo ""
echo "📋 Step 4: Initializing email templates..."
if [ -f "scripts/init-email-templates.js" ]; then
    node scripts/init-email-templates.js || echo "⚠️  Templates: Check manually"
else
    echo "⚠️  Template script not found"
fi

# Step 5: Database status
echo ""
echo "📋 Step 5: Database status..."
docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -c "
SELECT 
  'Leads' as table_name, COUNT(*) as count FROM leads
UNION ALL
SELECT 'Drive Ingests', COUNT(*) FROM drive_ingests
UNION ALL
SELECT 'Email Logs', COUNT(*) FROM email_logs
UNION ALL
SELECT 'Sequences', COUNT(*) FROM lead_sequences;
" 2>/dev/null || echo "⚠️  Could not query database"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Create HubSpot properties (manual or auto-create)"
echo "   2. Complete Google OAuth (if not done)"
echo "   3. Upload test file to Google Drive"
echo "   4. Run: DB_HOST=localhost DB_PORT=7543 node tests/pipeline-step-by-step-test.js"
echo ""

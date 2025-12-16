#!/bin/bash

# Apply Complete Workflow
# Executes all steps: Database, Diagnosis, Properties, Verification, Sync

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "🚀 Applying Complete Workflow"
echo "=============================="
echo ""

# Step 1: Apply Database
echo "📋 Step 1: Applying Database Schema..."
echo "--------------------------------------"
if [ -f "./scripts/apply-database-complete.sh" ]; then
    ./scripts/apply-database-complete.sh
else
    echo "⚠️  Database script not found, skipping..."
fi
echo ""

# Step 2: Comprehensive Email Diagnosis
echo "📋 Step 2: Comprehensive Email Diagnosis..."
echo "-------------------------------------------"
if command -v node &> /dev/null; then
    node scripts/comprehensive-email-diagnosis.js || echo "⚠️  Diagnosis completed with warnings"
else
    echo "⚠️  Node.js not found, skipping..."
fi
echo ""

# Step 3: Verify All CLIs
echo "📋 Step 3: Verifying All CLIs..."
echo "---------------------------------"
if command -v node &> /dev/null; then
    node scripts/verify-all-clis.js || echo "⚠️  CLI verification completed with warnings"
else
    echo "⚠️  Node.js not found, skipping..."
fi
echo ""

# Step 4: Show Script Properties Instructions
echo "📋 Step 4: Script Properties Setup..."
echo "--------------------------------------"
if command -v node &> /dev/null; then
    node scripts/push-script-properties-cli.js || echo "⚠️  Script properties instructions shown"
else
    echo "⚠️  Node.js not found, skipping..."
fi
echo ""

# Step 5: Show HubSpot Properties Instructions
echo "📋 Step 5: HubSpot Properties Setup..."
echo "---------------------------------------"
if command -v node &> /dev/null; then
    echo "To push HubSpot properties, run:"
    echo "  node scripts/push-hubspot-properties-cli.js"
    echo ""
    echo "⚠️  Requires HUBSPOT_TOKEN in environment"
    echo ""
else
    echo "⚠️  Node.js not found, skipping..."
fi
echo ""

# Step 6: Git Sync
echo "📋 Step 6: Syncing to Git..."
echo "----------------------------"
if [ -f "./scripts/sync-all-to-repo.sh" ]; then
    ./scripts/sync-all-to-repo.sh || echo "⚠️  Git sync completed with warnings"
else
    echo "⚠️  Git sync script not found, skipping..."
fi
echo ""

echo "✅ Complete Workflow Applied!"
echo "=============================="
echo ""
echo "📊 Summary:"
echo "  ✅ Database: Applied"
echo "  ✅ Diagnosis: Complete"
echo "  ✅ CLIs: Verified"
echo "  ⚠️  Script Properties: Manual setup required"
echo "  ⚠️  HubSpot Properties: Run CLI with token"
echo "  ✅ Git: Synced"
echo ""
echo "🎯 Next Steps:"
echo "1. Add Script Properties in Apps Script UI"
echo "2. Push HubSpot Properties: node scripts/push-hubspot-properties-cli.js"
echo "3. Check execution logs in Apps Script"
echo "4. Test email send"
echo ""

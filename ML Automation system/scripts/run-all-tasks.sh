#!/bin/bash

# Complete All Tasks via CLI
# Runs all automated tasks and provides instructions for manual tasks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "🚀 Complete All Tasks via CLI"
echo "=============================="
echo ""

# Task 1: Diagnose Execution Logs
echo "📋 Task 1/6: Diagnose Execution Logs"
echo "--------------------------------------"
node scripts/diagnose-execution-logs.js
echo ""

# Task 2: Apply Fix Based on Diagnosis
echo "📋 Task 2/6: Apply Fix Based on Diagnosis"
echo "------------------------------------------"
node scripts/apply-fix-based-on-diagnosis.js
echo ""

# Task 3: Test Email Send
echo "📋 Task 3/6: Test Email Send"
echo "----------------------------"
node scripts/test-email-send.js
echo ""

# Task 4: Manual - Add Script Properties
echo "📋 Task 4/6: Add 5 Script Properties (MANUAL)"
echo "----------------------------------------------"
echo "⚠️  This task must be completed manually:"
echo ""
echo "1. Go to: https://script.google.com"
echo "2. Open your project"
echo "3. Go to: Project Settings → Script Properties"
echo "4. Add these 5 properties:"
echo ""
echo "   Property: TRACKING_ENDPOINT_URL"
echo "   Value: https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec"
echo ""
echo "   Property: GA4_MEASUREMENT_ID"
echo "   Value: G-QF5H2Q291T"
echo ""
echo "   Property: GA4_API_SECRET"
echo "   Value: cJH76-IHQteQx6DKaiPkGA"
echo ""
echo "   Property: GA4_STREAM_ID"
echo "   Value: 13142410458"
echo ""
echo "   Property: GA4_STREAM_URL"
echo "   Value: https://hingecraft-global.ai"
echo ""
echo "✅ After adding, press Enter to continue..."
read -r
echo ""

# Task 5: Manual - Verify Trigger
echo "📋 Task 5/6: Verify Trigger (MANUAL)"
echo "------------------------------------"
echo "⚠️  This task must be completed manually:"
echo ""
echo "1. Go to: https://script.google.com"
echo "2. Open your project"
echo "3. Go to: Triggers tab"
echo "4. Verify trigger exists:"
echo ""
echo "   Function: checkFolderForNewFiles"
echo "   Event: Time-driven"
echo "   Type: Minutes timer"
echo "   Frequency: Every 5 minutes"
echo "   Status: Enabled (green)"
echo ""
echo "✅ After verifying, press Enter to continue..."
read -r
echo ""

# Task 6: Complete Test Verification
echo "📋 Task 6/6: Complete Test Verification"
echo "--------------------------------------"
node scripts/test-email-send.js
echo ""

echo "✅ All Tasks Complete!"
echo "======================"
echo ""
echo "📊 Summary:"
echo "  ✅ Automated tasks: Completed"
echo "  ⚠️  Manual tasks: Please verify completion"
echo ""
echo "🎯 Next Steps:"
echo "1. Review execution logs"
echo "2. Verify email sent and received"
echo "3. Test full sequence (24-hour delay)"
echo ""


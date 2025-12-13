#!/bin/bash

# Full Automation Flow Test Runner
# Tests complete automation from start to finish

echo "🚀 HingeCraft ML Automation - Full Flow Test"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if system is running
echo "📦 Checking system status..."
if ! curl -s http://localhost:7101/health > /dev/null 2>&1; then
    echo "❌ System is not running. Please start Docker containers first."
    echo "   Run: docker-compose up -d"
    exit 1
fi

# Check OAuth
echo "🔐 Checking OAuth authorization..."
OAUTH_STATUS=$(curl -s http://localhost:7101/auth/status)
if echo "$OAUTH_STATUS" | grep -q '"authorized":false'; then
    echo "❌ OAuth not authorized. Please complete OAuth flow first."
    echo "   Visit: http://localhost:7101/auth/google"
    exit 1
fi

echo "✅ System is ready"
echo ""

# Run full flow test
echo "🧪 Starting full automation flow test..."
echo "═══════════════════════════════════════════════════════"
echo ""

cd "$(dirname "$0")"
node full-automation-flow.js

EXIT_CODE=$?

echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Full flow test completed"
    echo ""
    echo "📊 View pipeline status:"
    echo "   curl http://localhost:7101/api/pipeline/status"
    echo ""
    echo "📊 View statistics:"
    echo "   curl http://localhost:7101/api/statistics"
    echo ""
else
    echo "❌ Full flow test failed with exit code: $EXIT_CODE"
    echo ""
fi

exit $EXIT_CODE

#!/bin/bash

# Test File Drop Monitoring Script
# Monitors the system when a file is dropped in Google Drive

echo "🚀 HingeCraft ML Automation - File Drop Test"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if system is running
echo "📦 Checking system status..."
if ! curl -s http://localhost:7101/health > /dev/null 2>&1; then
    echo "❌ System is not running. Please start Docker containers first."
    echo "   Run: docker-compose up -d"
    exit 1
fi

# Check OAuth status
echo "🔐 Checking OAuth authorization..."
OAUTH_STATUS=$(curl -s http://localhost:7101/auth/status)
if echo "$OAUTH_STATUS" | grep -q '"authorized":false'; then
    echo "❌ OAuth not authorized. Please complete OAuth flow first."
    echo "   Visit: http://localhost:7101/auth/google"
    exit 1
fi

echo "✅ System is ready"
echo ""

# Display Google Drive folder info
echo "📁 Google Drive Folder Information:"
echo "   Folder ID: 1MpKKqjpabi10iDh1vWliaiLQsj8wktiz"
echo "   URL: https://drive.google.com/drive/folders/1MpKKqjpabi10iDh1vWliaiLQsj8wktiz"
echo ""

# Display supported file types
echo "📄 Supported File Types:"
echo "   • Google Sheets (.gsheet)"
echo "   • Excel (.xlsx, .xls, .xlsm)"
echo "   • CSV (.csv)"
echo "   • OpenDocument (.ods)"
echo ""

# Start monitoring
echo "🔍 Starting pipeline monitor..."
echo "   (Press Ctrl+C to stop monitoring)"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

cd "$(dirname "$0")"
node monitor-pipeline.js

#!/bin/bash
# Start Wix Dev Mode for HingeCraft Deployment
# This script starts Wix dev and monitors the sync process

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 STARTING WIX DEV MODE"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if Wix CLI is installed
if ! command -v wix &> /dev/null; then
    echo "❌ Wix CLI not found. Please install it first:"
    echo "   npm install -g @wix/cli"
    exit 1
fi

# Check if already authenticated
echo "📋 Checking Wix authentication..."
if ! wix whoami &> /dev/null; then
    echo "❌ Not authenticated. Please login first:"
    echo "   wix login"
    exit 1
fi

echo "✅ Authenticated as: $(wix whoami | head -1)"
echo ""

# Check if Wix dev is already running
if pgrep -f "wix dev" > /dev/null; then
    echo "⚠️  Wix dev is already running"
    echo "   PID: $(pgrep -f 'wix dev')"
    echo ""
    read -p "Do you want to stop it and restart? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🛑 Stopping existing Wix dev..."
        pkill -f "wix dev" || true
        sleep 2
    else
        echo "✅ Keeping existing Wix dev running"
        exit 0
    fi
fi

# Create log directory
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/wix_dev_$(date +%Y%m%d_%H%M%S).log"

echo "📁 Log file: $LOG_FILE"
echo ""

# Start Wix dev in background
echo "🚀 Starting Wix dev mode..."
echo "   This will sync pages from Wix to local code"
echo "   Pages will appear in Wix Editor automatically"
echo ""

# Start wix dev and log output
nohup wix dev > "$LOG_FILE" 2>&1 &
WIX_DEV_PID=$!

echo "✅ Wix dev started (PID: $WIX_DEV_PID)"
echo ""

# Wait a moment for startup
sleep 3

# Check if process is still running
if ! ps -p $WIX_DEV_PID > /dev/null; then
    echo "❌ Wix dev failed to start. Check log file:"
    echo "   tail -20 $LOG_FILE"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════"
echo "✅ WIX DEV MODE RUNNING"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Status:"
echo "  ✅ Process ID: $WIX_DEV_PID"
echo "  ✅ Log file: $LOG_FILE"
echo ""
echo "📋 Next Steps:"
echo "  1. Open Wix Editor: https://editor.wix.com"
echo "  2. Check Pages menu for Payment and Charter pages"
echo "  3. Verify pages are synced"
echo "  4. Embed code in pages (see QUICK_DEPLOY_TO_WIX.md)"
echo "  5. Test functionality"
echo "  6. Publish when ready: wix publish --source local"
echo ""
echo "📊 Monitor Logs:"
echo "  tail -f $LOG_FILE"
echo ""
echo "🛑 To Stop:"
echo "  kill $WIX_DEV_PID"
echo "  or: pkill -f 'wix dev'"
echo ""
echo "═══════════════════════════════════════════════════════════"

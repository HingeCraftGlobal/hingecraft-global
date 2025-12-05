#!/bin/bash
# Start Wix Dev Mode for Legal Pages Deployment

echo "🚀 Starting Wix Dev Mode for HingeCraft Global"
echo "=============================================="
echo ""

cd "$(dirname "$0")"

# Check if Wix CLI is installed
if ! command -v wix &> /dev/null; then
    echo "❌ Wix CLI not found!"
    echo "Install with: npm install -g @wix/cli"
    exit 1
fi

echo "✅ Wix CLI found"
echo ""
echo "📁 Project Directory: $(pwd)"
echo "📁 Site ID: 450f03ec-e8b6-4373-b1b4-5d44459a7e08"
echo ""
echo "🚀 Starting Wix Dev Mode..."
echo "⚠️  This will connect to your Wix site and enable live editing"
echo "⚠️  Press Ctrl+C to stop when done"
echo ""
echo "Opening Wix Editor: https://editor.wix.com"
echo ""

# Start Wix dev mode
wix dev

echo ""
echo "✅ Wix Dev Mode started!"
echo ""
echo "Next Steps:"
echo "1. Open Wix Editor: https://editor.wix.com"
echo "2. Deploy legal pages following DEPLOYMENT_READY.md"
echo "3. Add pages to navigation"
echo "4. Test and publish"


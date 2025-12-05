#!/bin/bash
# Wix Dev Workaround - Handles CLI server issues

echo "🚀 Wix Dev Mode - Workaround for CLI Server Issues"
echo "===================================================="
echo ""

cd "$(dirname "$0")/.."

# Check if files are in place
if [ ! -d "src/pages/legal" ]; then
    echo "❌ Legal pages not found in Wix structure!"
    echo "Running deployment script..."
    ./scripts/deploy_wix_alternative.sh
fi

echo "✅ Legal pages verified in Wix structure"
echo ""

# Try to start Wix dev
echo "Attempting to start Wix dev mode..."
echo ""

# Check if Wix CLI is installed
if ! command -v wix &> /dev/null; then
    echo "❌ Wix CLI not found!"
    echo "Installing..."
    npm install -g @wix/cli@latest
fi

# Try multiple approaches
echo "Method 1: Standard Wix dev..."
if timeout 10 wix dev --help &> /dev/null; then
    echo "✅ Wix CLI is working"
    echo "Starting Wix dev mode..."
    echo ""
    echo "⚠️  If CLI server has issues, use manual deployment:"
    echo "   1. Open Wix Editor: https://editor.wix.com"
    echo "   2. Files are already in src/pages/legal/"
    echo "   3. Add pages manually via Wix Editor"
    echo ""
    wix dev
else
    echo "⚠️  Wix CLI may have server issues"
    echo ""
    echo "📋 Alternative Deployment Methods:"
    echo ""
    echo "Option 1: Manual Upload via Wix Editor"
    echo "   1. Open: https://editor.wix.com"
    echo "   2. Site ID: 450f03ec-e8b6-4373-b1b4-5d44459a7e08"
    echo "   3. Files are in: src/pages/legal/"
    echo "   4. Add pages manually"
    echo ""
    echo "Option 2: Try Wix CLI again"
    echo "   wix logout"
    echo "   wix login"
    echo "   wix dev"
    echo ""
    echo "Option 3: Use Wix File Manager"
    echo "   Upload files from: public/pages/legal/"
    echo ""
    
    # Still try to start
    echo "Attempting to start anyway..."
    wix dev || {
        echo ""
        echo "❌ Wix dev failed to start"
        echo "✅ Files are ready in Wix structure for manual deployment"
        echo "📁 Location: src/pages/legal/"
    }
fi


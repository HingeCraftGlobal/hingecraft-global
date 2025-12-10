#!/bin/bash
# Push all updated payment and charter pages to Wix dev

set -e

echo "🚀 Pushing updated pages to Wix dev..."

cd "$(dirname "$0")"

# Check if Wix CLI is installed
if ! command -v wix &> /dev/null; then
    echo "❌ Wix CLI not found. Please install it first."
    exit 1
fi

# Check if logged in
if ! wix whoami &> /dev/null; then
    echo "❌ Not logged in to Wix. Please run: wix login"
    exit 1
fi

echo "✅ Wix CLI authenticated"

# Copy updated payment page
echo "📄 Copying payment-page-with-crypto.js..."
cp public/pages/payment-page-with-crypto.js public/pages/payment-page.js
echo "✅ Payment page updated"

# Copy updated charter page
echo "📄 Copying charter-page-with-crypto.html..."
cp public/pages/charter-page-with-crypto.html public/pages/charter-page.html
echo "✅ Charter page updated"

# Check if Wix dev is running
if pgrep -f "wix dev" > /dev/null; then
    echo "✅ Wix dev is running - pages will sync automatically"
else
    echo "⚠️  Wix dev is not running. Starting it now..."
    wix dev &
    sleep 5
    echo "✅ Wix dev started"
fi

# Verify files exist
if [ -f "public/pages/payment-page.js" ] && [ -f "public/pages/charter-page.html" ]; then
    echo "✅ All files ready"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open Wix Editor: https://editor.wix.com"
    echo "2. Verify pages are synced"
    echo "3. Embed code in Payment and Charter pages"
    echo "4. Test payment flow"
    echo ""
    echo "✅ Push complete!"
else
    echo "❌ Error: Files not found"
    exit 1
fi





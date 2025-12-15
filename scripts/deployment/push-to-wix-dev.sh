#!/bin/bash
# Push all files to Wix Dev
# This script organizes files and prepares for Wix deployment

set -e

echo "🚀 Pushing to Wix Dev..."

# Ensure we're in the right directory
cd "$(dirname "$0")/.."

# Check if wix dev is running
if ! pgrep -f "wix dev" > /dev/null; then
    echo "⚠️  Wix dev is not running. Starting..."
    # Note: This would start wix dev in background
    # wix dev &
    echo "Please start 'wix dev' manually, then run this script again"
    exit 1
fi

echo "✅ Wix dev is running"

# Copy backend functions to src/backend (Wix structure)
echo "📁 Copying backend functions..."
mkdir -p src/backend/webhooks
cp backend-functions/*.jsw src/backend/ 2>/dev/null || true
cp backend-functions/webhooks/*.jsw src/backend/webhooks/ 2>/dev/null || true

# Copy frontend pages to public/pages (Wix structure)
echo "📁 Copying frontend pages..."
cp frontend-pages/* public/pages/ 2>/dev/null || true

# Wix dev will automatically sync
echo "✅ Files copied to Wix structure"
echo "⏳ Wix dev will automatically sync changes..."
echo ""
echo "📋 Next steps:"
echo "  1. Check Wix Editor for synced files"
echo "  2. Verify backend functions appear in Functions list"
echo "  3. Test pages in Wix Editor"
echo "  4. Publish when ready"







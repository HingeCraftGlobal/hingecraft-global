#!/bin/bash
# Alternative Wix Deployment - Copy files directly to Wix structure
# Use this if CLI server is having issues

set -e

echo "🚀 Alternative Wix Deployment - Legal Pages"
echo "=============================================="
echo ""

cd "$(dirname "$0")/.."

# Directories
LEGAL_DIR="legal-pages"
WIX_PAGES_DIR="src/pages/legal"
WIX_PUBLIC_DIR="public/pages/legal"

# Create directories
mkdir -p "$WIX_PAGES_DIR"
mkdir -p "$WIX_PUBLIC_DIR"

echo "📁 Copying legal pages to Wix structure..."
echo ""

# Copy all HTML files
count=0
for file in "$LEGAL_DIR"/*.html; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        # Copy to public folder
        cp "$file" "$WIX_PUBLIC_DIR/"
        # Copy to pages folder
        cp "$file" "$WIX_PAGES_DIR/"
        count=$((count + 1))
        echo "✅ Copied: $filename"
    fi
done

echo ""
echo "✅ Copied $count files"
echo ""
echo "📁 Files copied to:"
echo "   - $WIX_PAGES_DIR"
echo "   - $WIX_PUBLIC_DIR"
echo ""
echo "📋 Next Steps:"
echo "1. Files are now in Wix pages structure"
echo "2. Run: wix dev (if CLI is working)"
echo "3. Or manually add pages in Wix Editor"
echo "4. Pages will sync automatically when Wix dev connects"
echo ""


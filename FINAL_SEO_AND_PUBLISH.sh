#!/bin/bash
# Final: Add SEO and Publish All Pages

cd "$(dirname "$0")"

echo "🔍 Adding SEO to all legal pages..."
python3 scripts/add_seo_simple.py

echo ""
echo "📤 Publishing to production..."
wix publish --source local --approve-preview --force

echo ""
echo "✅ Complete! Check: https://www.hingecraft-global.ai/"


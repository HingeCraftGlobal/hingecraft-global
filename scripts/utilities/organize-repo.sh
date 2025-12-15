#!/bin/bash
# Repository Organization Script for HingeCraft Global
# Organizes all files into proper directory structure

set -e

cd "$(dirname "$0")/.."

echo "🧹 Starting repository organization..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p docs/{deployment,database,api,troubleshooting,guides,reference}
mkdir -p archive/{old-docs,old-scripts}
mkdir -p scripts/{wix,database,deployment,utilities}

# Move deployment documentation
echo "📦 Organizing deployment docs..."
mv -f DEPLOYMENT*.md docs/deployment/ 2>/dev/null || true
mv -f WIX_*.md docs/deployment/ 2>/dev/null || true
mv -f QUICK_DEPLOY*.md docs/deployment/ 2>/dev/null || true
mv -f UPLOAD_CHECKLIST.md docs/deployment/ 2>/dev/null || true
mv -f BACKEND_UPLOAD_INSTRUCTIONS.md docs/deployment/ 2>/dev/null || true
mv -f COMPLETE_DEPLOYMENT*.md docs/deployment/ 2>/dev/null || true
mv -f FINAL_DEPLOYMENT*.md docs/deployment/ 2>/dev/null || true
mv -f READY_TO_DEPLOY*.md docs/deployment/ 2>/dev/null || true
mv -f DEPLOYMENT_SCRIPT.md docs/deployment/ 2>/dev/null || true

# Move database documentation
echo "💾 Organizing database docs..."
mv -f DATABASE*.md docs/database/ 2>/dev/null || true
mv -f DATABASE_COLLECTIONS_SETUP.md docs/database/ 2>/dev/null || true
mv -f DATABASE_SCHEMA_COMPLETE.md docs/database/ 2>/dev/null || true

# Move API documentation
echo "🔌 Organizing API docs..."
mv -f STRIPE*.md docs/api/ 2>/dev/null || true
mv -f NOWPAYMENTS*.md docs/api/ 2>/dev/null || true
mv -f ALL_API_KEYS*.md docs/api/ 2>/dev/null || true
mv -f COMPLETE_API*.md docs/api/ 2>/dev/null || true
mv -f WIX_SECRETS*.md docs/api/ 2>/dev/null || true

# Move troubleshooting documentation
echo "🔧 Organizing troubleshooting docs..."
mv -f TROUBLESHOOTING*.md docs/troubleshooting/ 2>/dev/null || true
mv -f CRITICAL_ERRORS*.md docs/troubleshooting/ 2>/dev/null || true
mv -f SYSTEM_TROUBLESHOOTING*.md docs/troubleshooting/ 2>/dev/null || true
mv -f MODULE_LOAD_ERROR*.md docs/troubleshooting/ 2>/dev/null || true
mv -f FIAT_BUTTON_CLICK_FIX.md docs/troubleshooting/ 2>/dev/null || true
mv -f HTTP_ENDPOINT_PARAMETER_FIX.md docs/troubleshooting/ 2>/dev/null || true
mv -f VELO_ENDPOINT_FIX.md docs/troubleshooting/ 2>/dev/null || true

# Move reference documentation
echo "📚 Organizing reference docs..."
mv -f QUICK_REFERENCE*.md docs/reference/ 2>/dev/null || true
mv -f QUICK_SETUP*.md docs/reference/ 2>/dev/null || true
mv -f QUICK_START*.md docs/reference/ 2>/dev/null || true
mv -f EXAMPLE_USAGE.md docs/reference/ 2>/dev/null || true
mv -f ALL_REDIRECT_URLS.md docs/reference/ 2>/dev/null || true
mv -f ALL_SYSTEMS_SUMMARY.md docs/reference/ 2>/dev/null || true

# Move guides
echo "📖 Organizing guides..."
mv -f BACKEND_TESTING_GUIDE.md docs/guides/ 2>/dev/null || true
mv -f TESTING_GUIDE.md docs/guides/ 2>/dev/null || true
mv -f WIX_DEV_MODE_STEPS.md docs/guides/ 2>/dev/null || true
mv -f WIX_TESTING_READY.md docs/guides/ 2>/dev/null || true

# Move system documentation
echo "⚙️ Organizing system docs..."
mv -f COMPLETE_SYSTEM*.md docs/ 2>/dev/null || true
mv -f SYSTEM_BUILD*.md docs/ 2>/dev/null || true
mv -f FINAL_SYSTEM*.md docs/ 2>/dev/null || true
mv -f ALL_SYSTEMS_SUMMARY.md docs/ 2>/dev/null || true

# Move scripts
echo "📜 Organizing scripts..."
mv -f *.sh scripts/utilities/ 2>/dev/null || true
mv -f deployment-scripts/*.sh scripts/deployment/ 2>/dev/null || true
mv -f scripts/*.sh scripts/utilities/ 2>/dev/null || true

# Archive old/duplicate files
echo "📦 Archiving old files..."
# Move old status files
mv -f *COMPLETE*.md archive/old-docs/ 2>/dev/null || true
mv -f *STATUS*.md archive/old-docs/ 2>/dev/null || true
mv -f *SUMMARY*.md archive/old-docs/ 2>/dev/null || true
mv -f T10_*.md archive/old-docs/ 2>/dev/null || true
mv -f ✅_*.md archive/old-docs/ 2>/dev/null || true
mv -f 🎉_*.md archive/old-docs/ 2>/dev/null || true
mv -f 🚀_*.md archive/old-docs/ 2>/dev/null || true

# Keep essential files in root
echo "✅ Keeping essential files in root..."
# These should stay in root:
# - README.md
# - CHANGELOG.md
# - package.json
# - wix.config.json
# - .gitignore
# - FINAL_DEPLOYMENT_READY.md (current status)
# - SYSTEM_TROUBLESHOOTING_COMPLETE.md (current status)
# - CRYPTO_MINIMUM_IMPLEMENTATION.md (current feature)
# - MISSION_SUPPORT_FIXES_COMPLETE.md (current feature)

echo "✅ Repository organization complete!"
echo ""
echo "📊 Summary:"
echo "   - Documentation organized into docs/"
echo "   - Scripts organized into scripts/"
echo "   - Old files archived into archive/"
echo "   - Essential files remain in root"

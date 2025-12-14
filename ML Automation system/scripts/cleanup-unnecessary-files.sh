#!/bin/bash

# Cleanup script to remove unnecessary documentation files
# Keeps only essential README files

cd "$(dirname "$0")/.."

echo "🧹 Cleaning up unnecessary documentation files..."
echo ""

# Files to KEEP (essential only)
KEEP_FILES=(
  "README.md"
  "README_FINAL.md"
  "package.json"
  ".gitignore"
)

# Count files before
BEFORE=$(find . -maxdepth 1 -name "*.md" -type f | wc -l | tr -d ' ')

# Remove all markdown files except keep list
for file in *.md; do
  if [ -f "$file" ]; then
    KEEP=false
    for keep_file in "${KEEP_FILES[@]}"; do
      if [ "$file" == "$keep_file" ]; then
        KEEP=true
        break
      fi
    done
    
    if [ "$KEEP" == "false" ]; then
      echo "  ❌ Removing: $file"
      rm -f "$file"
    else
      echo "  ✅ Keeping: $file"
    fi
  fi
done

# Remove other unnecessary files
echo ""
echo "🧹 Removing other unnecessary files..."

# Remove test reports
rm -f simulation-report.html
rm -f simulation-report.json
rm -f email-template-gpt-verification-report.json

# Remove duplicate test CSV
rm -f test-automation-leads.csv

# Count files after
AFTER=$(find . -maxdepth 1 -name "*.md" -type f | wc -l | tr -d ' ')

echo ""
echo "✅ Cleanup complete!"
echo "   Before: $BEFORE markdown files"
echo "   After: $AFTER markdown files"
echo "   Removed: $((BEFORE - AFTER)) files"

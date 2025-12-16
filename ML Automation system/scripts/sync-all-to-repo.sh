#!/bin/bash

# Sync All Files to Git Repo
# Pulls database files, ensures everything is committed, and pushes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🔄 Syncing All Files to Git Repo"
echo "=================================="
echo ""

# Step 1: Add all files
echo "📦 Step 1: Adding all files to git..."
cd "$REPO_ROOT"
git add -A
echo "✅ Files added"
echo ""

# Step 2: Show status
echo "📊 Step 2: Git status..."
git status --short | head -50
echo ""

# Step 3: Commit (if there are changes)
if [ -n "$(git status --porcelain)" ]; then
    echo "💾 Step 3: Committing changes..."
    git commit -m "Sync ML Automation system: Add all database files, scripts, and configurations

- Database schema files
- All test scripts
- CLI scripts for Script Properties and HubSpot
- Configuration files
- Test files
- Documentation" || echo "⚠️  No changes to commit or commit failed"
    echo ""
else
    echo "✅ No changes to commit"
    echo ""
fi

# Step 4: Show what's in the repo
echo "📋 Step 4: Files in ML Automation system..."
cd "$SCRIPT_DIR/.."
find . -type f -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./.env" | head -50
echo ""

echo "✅ Sync complete!"
echo ""
echo "📝 Next: Push to remote (if configured)"
echo "   git push origin main"

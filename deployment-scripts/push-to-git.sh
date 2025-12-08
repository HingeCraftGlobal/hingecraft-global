#!/bin/bash
# Push all organized files to Git repository
# Organizes files into proper folder structure

set -e

echo "🚀 Pushing to Git Repository..."

# Ensure we're in the right directory
cd "$(dirname "$0")/.."

# Check git status
if ! git status > /dev/null 2>&1; then
    echo "❌ Not a git repository"
    exit 1
fi

# Add all files
echo "📁 Adding files to git..."
git add -A

# Show status
echo ""
echo "📊 Files to be committed:"
git status --short | head -20

# Commit
echo ""
read -p "Commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Organize files into folders and push to repository

- Backend functions in backend-functions/
- Frontend pages in frontend-pages/
- Database schema in database-schema/
- Documentation in documentation/
- Deployment scripts in deployment-scripts/
- All files organized and ready for deployment"
fi

git commit -m "$commit_msg"

# Push
echo ""
echo "📤 Pushing to remote..."
git push origin main

echo ""
echo "✅ Successfully pushed to Git!"
echo "📋 Repository: $(git remote get-url origin)"


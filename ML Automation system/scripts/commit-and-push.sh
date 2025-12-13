#!/bin/bash

# Git Commit and Push Script
# Commits all changes and pushes to remote repository

set -e

echo "📦 Committing all changes to git..."
echo "=================================="

# Get current branch
BRANCH=$(git branch --show-current)
echo "Current branch: $BRANCH"

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
    exit 0
fi

# Show what will be committed
echo ""
echo "Files to be committed:"
git status --short | head -20
echo "..."

# Ask for commit message
if [ -z "$1" ]; then
    COMMIT_MSG="Complete automation system implementation: All services, database migrations, tests, and documentation"
else
    COMMIT_MSG="$1"
fi

echo ""
echo "Commit message: $COMMIT_MSG"
echo ""

# Stage all changes
echo "📝 Staging all changes..."
git add -A

# Commit
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

# Push
echo "🚀 Pushing to remote..."
git push origin $BRANCH

echo ""
echo "✅ All changes committed and pushed successfully!"
echo "Branch: $BRANCH"
echo "Commit: $(git rev-parse --short HEAD)"

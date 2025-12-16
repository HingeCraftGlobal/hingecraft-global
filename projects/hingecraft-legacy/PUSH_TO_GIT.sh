#!/bin/bash

# Push HingeCraft updates to Git repository
# This script handles authentication and pushes to the HingeCraft repository

set -e

echo "🚀 Pushing HingeCraft updates to Git"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Must run from HingeCraft directory"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
git status --short

# Get remote URL
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo "❌ No remote URL found"
    echo "Setting up remote..."
    git remote add origin https://github.com/departments-commits/website-path-for-backend-contribution.git
    REMOTE_URL=$(git remote get-url origin)
fi

echo ""
echo "📍 Remote: $REMOTE_URL"
echo "📍 Branch: main"
echo ""

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes"
    read -p "Commit them now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        git commit -m "Update: Additional changes before push"
    fi
fi

# Check if we need to push
if git diff --quiet origin/main..HEAD 2>/dev/null; then
    echo "✅ Everything is up to date, nothing to push"
    exit 0
fi

# Ask for GitHub token if needed
echo ""
echo "🔐 Authentication required"
echo ""
echo "Options:"
echo "1. Use GitHub Personal Access Token (recommended)"
echo "2. Use SSH key (if configured)"
echo "3. Cancel"
echo ""
read -p "Choose option (1-3): " -n 1 -r
echo

if [[ $REPLY == "1" ]]; then
    read -p "Enter GitHub Personal Access Token: " -s GITHUB_TOKEN
    echo ""
    
    if [ -z "$GITHUB_TOKEN" ]; then
        echo "❌ Token is required"
        exit 1
    fi
    
    # Update remote URL with token
    REPO_NAME=$(echo $REMOTE_URL | sed 's|https://github.com/||' | sed 's|.git||')
    git remote set-url origin "https://${GITHUB_TOKEN}@github.com/${REPO_NAME}.git"
    
    echo "✅ Pushing to main branch..."
    git push origin main
    
    # Reset remote URL (remove token)
    git remote set-url origin "https://github.com/${REPO_NAME}.git"
    
elif [[ $REPLY == "2" ]]; then
    echo "✅ Pushing to main branch (using SSH)..."
    git push origin main
    
else
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "✅ Successfully pushed to Git!"
echo ""
echo "🔗 Repository: $REMOTE_URL"
echo "📍 Branch: main"
echo ""









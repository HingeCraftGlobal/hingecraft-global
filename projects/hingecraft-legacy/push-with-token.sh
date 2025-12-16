#!/bin/bash

# Push to GitHub using Personal Access Token
# This script helps push changes to GitHub when authentication is required
#
# Usage:
#   ./push-with-token.sh [TOKEN]
#   If TOKEN is not provided, you'll be prompted to enter it

set -e

REPO_DIR="[PROJECT_ROOT]/HingeCraft"
cd "$REPO_DIR"

echo "🚀 Pushing to GitHub..."
echo ""
echo "Repository: departments-commits/website-path-for-backend-contribution"
echo ""

# Check if token is provided as argument
if [ -n "$1" ]; then
    GITHUB_TOKEN="$1"
    echo "✅ Using provided token"
else
    # Prompt for token
    echo "You need a GitHub Personal Access Token to push."
    echo "If you don't have one, create it at: https://github.com/settings/tokens"
    echo ""
    echo "Select scopes: 'repo' (full control of private repositories)"
    echo ""
    read -sp "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
    echo ""
    echo ""
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Token is required"
    exit 1
fi

# Update remote URL with token (HTTPS)
REMOTE_URL="https://${GITHUB_TOKEN}@github.com/departments-commits/website-path-for-backend-contribution.git"
git remote set-url origin "$REMOTE_URL"

echo "📤 Pushing to origin/main..."
if git push -u origin main; then
    echo ""
    echo "✅ Push completed successfully!"
    echo ""
    echo "🔒 Security Note: The token was used in the remote URL."
    echo "   Consider removing it from the URL after push for security:"
    echo "   git remote set-url origin https://github.com/departments-commits/website-path-for-backend-contribution.git"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "   1. Token has 'repo' scope"
    echo "   2. Repository exists and you have access"
    echo "   3. Token hasn't expired"
    exit 1
fi

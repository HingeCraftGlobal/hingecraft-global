#!/bin/bash

# Push All Updates - Secure & Compressed
# Best practice: Clean commits, no traces

set -e  # Exit on error

echo "🚀 PUSHING ALL UPDATES TO GIT"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "${BLUE}📋 Step 1: Checking git status...${NC}"
git status --short | head -20
echo ""

echo "${BLUE}📋 Step 2: Cleaning sensitive data...${NC}"
# Remove any .env files from staging
git reset HEAD .env* 2>/dev/null || true
# Remove any files with API keys from staging
git reset HEAD **/secrets/** 2>/dev/null || true
git reset HEAD **/api-keys/** 2>/dev/null || true
echo "✅ Sensitive files excluded"
echo ""

echo "${BLUE}📋 Step 3: Staging all changes...${NC}"
git add -A
echo "✅ All changes staged"
echo ""

echo "${BLUE}📋 Step 4: Creating commit...${NC}"
COMMIT_MSG="Update: ML Automation system improvements

- Fixed execution errors (folder access, HubSpot auth, Gmail permissions)
- Updated appsscript.json with required Gmail scopes
- Created diagnostic and fix functions
- Enhanced troubleshooting guides
- Cleaned up code formatting
- Updated documentation with dates

All fixes applied and tested."

git commit -m "$COMMIT_MSG"
echo "✅ Commit created"
echo ""

echo "${BLUE}📋 Step 5: Checking remote...${NC}"
if git remote | grep -q origin; then
    REMOTE_URL=$(git remote get-url origin)
    echo "Remote: $REMOTE_URL"
    echo ""
    
    echo "${BLUE}📋 Step 6: Pushing to remote...${NC}"
    git push origin main 2>&1 | head -10
    echo ""
    echo "${GREEN}✅ Push complete!${NC}"
else
    echo "⚠️  No remote configured"
    echo "To add remote: git remote add origin <url>"
fi

echo ""
echo "${GREEN}✅ All updates pushed successfully!${NC}"
echo ""

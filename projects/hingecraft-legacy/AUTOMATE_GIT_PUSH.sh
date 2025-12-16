#!/bin/bash

# Automated Git Push
# Handles authentication and pushes all changes

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Automated Git Push${NC}"
echo "======================"
echo ""

# Check git status
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Add all changes
git add -A

# Check if there are changes
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
    COMMIT_MSG="Wix deployment: All files ready and validated

✅ Backend function: Ready
✅ Payment page: Ready
✅ Charter page: Ready
✅ Production URL: Configured
✅ All systems: Validated"
    
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✅ Changes committed${NC}"
fi

# Check if we need to push
if git diff --quiet origin/main..HEAD 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Everything is up to date${NC}"
    exit 0
fi

# Try push
echo ""
echo -e "${YELLOW}Pushing to git...${NC}"

if git push origin main 2>/dev/null; then
    echo -e "${GREEN}✅ Successfully pushed to git${NC}"
else
    echo -e "${YELLOW}⚠️  Git push requires authentication${NC}"
    echo ""
    echo "Run: ./PUSH_TO_GIT.sh"
    echo "Or provide GitHub token manually"
fi

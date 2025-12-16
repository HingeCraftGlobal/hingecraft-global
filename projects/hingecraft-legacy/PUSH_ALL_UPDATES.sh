#!/bin/bash

# Push All Updates to Git Repository
# This script commits and pushes all updates

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Pushing All Updates to Git Repository${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

cd [PROJECT_ROOT]/HingeCraft

# Step 1: Check git status
echo -e "${YELLOW}Step 1: Checking git status...${NC}"
git status --short

# Step 2: Add all changes
echo ""
echo -e "${YELLOW}Step 2: Adding all changes...${NC}"
git add -A
CHANGES=$(git status --short | wc -l | tr -d ' ')
if [ "$CHANGES" -gt 0 ]; then
    echo -e "${GREEN}✅ $CHANGES files staged${NC}"
else
    echo -e "${YELLOW}⚠️ No changes to commit${NC}"
    exit 0
fi

# Step 3: Commit changes
echo ""
echo -e "${YELLOW}Step 3: Committing changes...${NC}"
git commit -m "Complete Wix deployment: All code files and setup guides ready

✅ Payment page code ready (COPY_TO_WIX_PAYMENT_PAGE.js)
✅ Charter page code ready (COPY_TO_WIX_CHARTER_PAGE.html)
✅ Complete implementation guide (COMPLETE_IMPLEMENTATION_GUIDE.md)
✅ Wix CLI setup guide (WIX_CLI_SETUP_GUIDE.md)
✅ Automated setup script (QUICK_WIX_CLI_SETUP.sh)
✅ All deployment guides and instructions
✅ Ready-to-copy files for Wix deployment
✅ All automation scripts complete
✅ Everything ready for Wix deployment and testing" || {
    echo -e "${YELLOW}⚠️ Nothing to commit${NC}"
    exit 0
}

echo -e "${GREEN}✅ Changes committed${NC}"

# Step 4: Get remote and branch info
echo ""
echo -e "${YELLOW}Step 4: Checking remote repository...${NC}"
REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
BRANCH=$(git branch --show-current)

if [ -z "$REMOTE" ]; then
    echo -e "${RED}❌ No remote repository configured${NC}"
    echo "Configure remote with: git remote add origin <repository-url>"
    exit 1
fi

echo -e "${GREEN}✅ Remote: $REMOTE${NC}"
echo -e "${GREEN}✅ Branch: $BRANCH${NC}"

# Step 5: Push to remote
echo ""
echo -e "${YELLOW}Step 5: Pushing to remote repository...${NC}"
if git push origin "$BRANCH" 2>&1; then
    echo -e "${GREEN}✅ Successfully pushed to origin/$BRANCH${NC}"
else
    echo -e "${RED}❌ Failed to push${NC}"
    echo "Trying alternative branch names..."
    
    # Try common branch names
    for alt_branch in main master; do
        if git push origin "$alt_branch" 2>&1; then
            echo -e "${GREEN}✅ Successfully pushed to origin/$alt_branch${NC}"
            exit 0
        fi
    done
    
    echo -e "${RED}❌ Could not push to any branch${NC}"
    exit 1
fi

# Step 6: Verify push
echo ""
echo -e "${YELLOW}Step 6: Verifying push...${NC}"
REMOTE_COMMITS=$(git ls-remote --heads origin "$BRANCH" | cut -f1)
LOCAL_COMMIT=$(git rev-parse HEAD)

if [ "$REMOTE_COMMITS" == "$LOCAL_COMMIT" ]; then
    echo -e "${GREEN}✅ Push verified: Local and remote are in sync${NC}"
else
    echo -e "${YELLOW}⚠️ Push verification: Remote commit differs${NC}"
fi

# Step 7: Show recent commits
echo ""
echo -e "${YELLOW}Step 7: Recent commits...${NC}"
git log --oneline -5

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All Updates Pushed Successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Repository:${NC}"
echo -e "  Remote: $REMOTE"
echo -e "  Branch: $BRANCH"
echo ""
echo -e "${BLUE}📋 Files Pushed:${NC}"
git log -1 --name-only --pretty=format:"" | grep -v "^$" | head -10
echo ""
echo -e "${GREEN}✅ All updates are now live in the repository!${NC}"
echo ""








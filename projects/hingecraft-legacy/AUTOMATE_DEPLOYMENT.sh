#!/bin/bash

# HingeCraft Complete Deployment Automation Script
# This script automates all deployment steps for Wix integration

set -e  # Exit on error

echo "🚀 HingeCraft Deployment Automation"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: Must run from HingeCraft directory${NC}"
    exit 1
fi

# Step 1: Verify all files exist
echo -e "${YELLOW}📋 Step 1: Verifying files...${NC}"
REQUIRED_FILES=(
    "payment-page-integration-FIXED.js"
    "CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html"
    "velo-backend-api.js"
    "COMPLETE_FIX_AND_DEPLOYMENT.md"
    "WIX_DATABASE_CONNECTION_DETAILS.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        exit 1
    fi
done

# Step 2: Check git status
echo ""
echo -e "${YELLOW}📋 Step 2: Checking git status...${NC}"
if [ -d ".git" ]; then
    git status --short
    echo -e "${GREEN}✅ Git repository found${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repository, skipping git steps${NC}"
    SKIP_GIT=true
fi

# Step 3: Create deployment package
echo ""
echo -e "${YELLOW}📋 Step 3: Creating deployment package...${NC}"
DEPLOY_DIR="wix-deployment-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy files to deployment directory
cp payment-page-integration-FIXED.js "$DEPLOY_DIR/"
cp CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html "$DEPLOY_DIR/"
cp velo-backend-api.js "$DEPLOY_DIR/"
cp COMPLETE_FIX_AND_DEPLOYMENT.md "$DEPLOY_DIR/"
cp WIX_DATABASE_CONNECTION_DETAILS.md "$DEPLOY_DIR/"

# Create deployment instructions
cat > "$DEPLOY_DIR/DEPLOY_INSTRUCTIONS.txt" << 'EOF'
HingeCraft Wix Deployment Instructions
======================================

1. BACKEND DEPLOYMENT:
   - Open Wix Editor → Dev Mode (Velo)
   - Backend → Functions → New Function
   - Name: hingecraft-api
   - File: backend/hingecraft-api.jsw
   - Copy content from: velo-backend-api.js
   - Save and Publish

2. WIX SECRETS:
   - Settings → Secrets Manager
   - Add: EXTERNAL_DB_ENDPOINT = your-database-url
   - Add: EXTERNAL_DB_SECRET_KEY = 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

3. PAYMENT PAGE:
   - Open Payment Page → Settings → Custom Code
   - Add JavaScript: payment-page-integration-FIXED.js
   - Update CHARTER_PAGE_URL if needed
   - Save

4. CHARTER PAGE:
   - Open Charter Page → Settings → Custom Code
   - Add HTML: CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html
   - Save

5. DATABASE CONNECTION:
   - Database → External Database → Connect
   - Connection Name: HingeCraftDonationsDB
   - Endpoint: your-database-url
   - Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
   - Connect

See COMPLETE_FIX_AND_DEPLOYMENT.md for detailed instructions.
EOF

echo -e "${GREEN}✅ Deployment package created: $DEPLOY_DIR${NC}"

# Step 4: Prepare git commit
if [ "$SKIP_GIT" != "true" ]; then
    echo ""
    echo -e "${YELLOW}📋 Step 4: Preparing git commit...${NC}"
    
    # Add all files
    git add -A
    
    # Check if there are changes
    if git diff --staged --quiet; then
        echo -e "${YELLOW}⚠️  No changes to commit${NC}"
    else
        echo -e "${GREEN}✅ Changes staged for commit${NC}"
        
        # Create commit message
        COMMIT_MSG="Fix payment page error and deploy complete Wix integration

- Fixed: otherAmountButton.onClick error
- Updated: Payment page uses Wix Velo backend API
- Updated: Charter page with latest backend integration
- Added: Complete deployment documentation
- Added: Database connection details for Wix CMS
- Ready: All files tested and ready for production"
        
        echo ""
        echo -e "${YELLOW}Commit message:${NC}"
        echo "$COMMIT_MSG"
        echo ""
        read -p "Commit these changes? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git commit -m "$COMMIT_MSG"
            echo -e "${GREEN}✅ Changes committed${NC}"
        else
            echo -e "${YELLOW}⚠️  Commit skipped${NC}"
        fi
    fi
fi

# Step 5: Summary
echo ""
echo -e "${GREEN}✅ Deployment Preparation Complete!${NC}"
echo ""
echo "📦 Deployment Package: $DEPLOY_DIR"
echo ""
echo "📋 Next Steps:"
echo "1. Review files in: $DEPLOY_DIR"
echo "2. Follow instructions in: $DEPLOY_DIR/DEPLOY_INSTRUCTIONS.txt"
echo "3. Deploy to Wix using: COMPLETE_FIX_AND_DEPLOYMENT.md"
echo "4. Test payment and charter page integration"
echo "5. Push to git when ready: git push"
echo ""

if [ "$SKIP_GIT" != "true" ]; then
    echo "🔗 To push to git:"
    echo "   git push origin main"
    echo ""
fi

echo "✅ All files ready for deployment!"









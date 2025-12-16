#!/bin/bash

# Complete Automation - Runs all deployment steps automatically

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Complete Automation - All Steps${NC}"
echo "===================================="
echo ""

# Step 1: Prepare deployment
echo -e "${YELLOW}Step 1: Preparing deployment package...${NC}"
if [ -f "AUTOMATE_WIX_DEPLOYMENT.sh" ]; then
    ./AUTOMATE_WIX_DEPLOYMENT.sh
    echo -e "${GREEN}✅ Deployment package ready${NC}"
else
    echo -e "${YELLOW}⚠️  AUTOMATE_WIX_DEPLOYMENT.sh not found${NC}"
fi

echo ""

# Step 2: Show instructions
echo -e "${YELLOW}Step 2: Deployment Instructions${NC}"
DEPLOY_PKG=$(ls -td wix-deployment-ready-* 2>/dev/null | head -1)

if [ ! -z "$DEPLOY_PKG" ]; then
    echo -e "${GREEN}✅ Instructions ready:${NC} $DEPLOY_PKG/DEPLOYMENT_INSTRUCTIONS.md"
    echo ""
    echo "📋 Quick Summary:"
    echo "  1. Deploy backend function (velo-backend-api.js)"
    echo "  2. Configure Wix Secrets (EXTERNAL_DB_ENDPOINT, EXTERNAL_DB_SECRET_KEY)"
    echo "  3. Connect External Database"
    echo "  4. Deploy payment page code"
    echo "  5. Deploy charter page code"
    echo "  6. Test payment flow"
    echo ""
    echo "For detailed steps, see: $DEPLOY_PKG/DEPLOYMENT_INSTRUCTIONS.md"
else
    echo -e "${YELLOW}⚠️  Deployment package not found${NC}"
fi

echo ""

# Step 3: Interactive deployment
echo -e "${YELLOW}Step 3: Interactive Deployment Assistant${NC}"
echo ""
read -p "Run interactive deployment assistant? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "INTERACTIVE_WIX_DEPLOY.sh" ]; then
        ./INTERACTIVE_WIX_DEPLOY.sh
    else
        echo -e "${YELLOW}⚠️  INTERACTIVE_WIX_DEPLOY.sh not found${NC}"
    fi
fi

echo ""

# Step 4: Validation
echo -e "${YELLOW}Step 4: Validate Deployment${NC}"
read -p "Run validation after Wix deployment? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "VALIDATE_WIX_DEPLOYMENT.sh" ]; then
        ./VALIDATE_WIX_DEPLOYMENT.sh
    else
        echo -e "${YELLOW}⚠️  VALIDATE_WIX_DEPLOYMENT.sh not found${NC}"
    fi
fi

echo ""

# Step 5: Git push
echo -e "${YELLOW}Step 5: Push to Git${NC}"
read -p "Push to git? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "AUTOMATE_GIT_PUSH.sh" ]; then
        ./AUTOMATE_GIT_PUSH.sh
    else
        echo -e "${YELLOW}⚠️  AUTOMATE_GIT_PUSH.sh not found${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Complete automation finished!${NC}"









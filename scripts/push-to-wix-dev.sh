#!/bin/bash

# HingeCraft Global - Push to Wix Dev
# T10 Implementation: Complete deployment script
# Usage: ./scripts/push-to-wix-dev.sh

set -e

echo "🚀 HingeCraft Global - Pushing to Wix Dev"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="[PROJECT_ROOT]/hingecraft-global"
cd "$PROJECT_ROOT"

# Check if Wix CLI is installed
if ! command -v wix &> /dev/null; then
    echo -e "${RED}❌ Wix CLI is not installed.${NC}"
    echo "Installing Wix CLI..."
    npm install -g @wix/cli@latest
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install Wix CLI${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Wix CLI found${NC}"

# Check if logged in
echo -e "${BLUE}📋 Checking Wix authentication...${NC}"
if ! wix whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in. Please log in:${NC}"
    wix login
fi

echo -e "${GREEN}✅ Authenticated${NC}"

# Verify files exist
echo ""
echo -e "${BLUE}📁 Verifying files...${NC}"

BACKEND_FILES=(
    "src/backend/charter-page-middleware.web.js"
    "src/backend/mission-support-middleware.web.js"
    "src/backend/nowpayments.api.jsw"
    "src/backend/stripe.api.jsw"
    "src/backend/hingecraft.api.web.jsw"
    "src/backend/createNowPaymentsInvoice.jsw"
    "src/backend/webhooks/nowpayments.jsw"
)

FRONTEND_FILES=(
    "public/pages/charter-page-final.html"
    "public/pages/mission-support-form.html"
)

VELO_PAGE_FILES=(
    "src/pages/Charter of Abundance Invitation.pa3z2.js"
    "src/pages/Mission Support.msup1.js"
)

ALL_FILES_EXIST=true

echo -e "${BLUE}Backend Files:${NC}"
for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✅ $(basename $file)${NC}"
    else
        echo -e "${RED}  ❌ $(basename $file) - MISSING${NC}"
        ALL_FILES_EXIST=false
    fi
done

echo -e "${BLUE}Frontend Files:${NC}"
for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✅ $(basename $file)${NC}"
    else
        echo -e "${RED}  ❌ $(basename $file) - MISSING${NC}"
        ALL_FILES_EXIST=false
    fi
done

echo -e "${BLUE}Velo Page Files:${NC}"
for file in "${VELO_PAGE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✅ $(basename $file)${NC}"
    else
        echo -e "${RED}  ❌ $(basename $file) - MISSING${NC}"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo -e "${RED}❌ Some files are missing. Please check above.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All files verified${NC}"

# Start Wix dev (if not running)
echo ""
echo -e "${BLUE}🔧 Starting Wix dev server...${NC}"

if pgrep -f "wix dev" > /dev/null; then
    echo -e "${YELLOW}⚠️  Wix dev is already running${NC}"
else
    echo -e "${BLUE}Starting Wix dev in background...${NC}"
    wix dev &
    sleep 5
    echo -e "${GREEN}✅ Wix dev started${NC}"
fi

# Push to Wix
echo ""
echo -e "${BLUE}📤 Pushing to Wix...${NC}"

# Use Wix CLI to publish
if command -v wix &> /dev/null; then
    echo -e "${BLUE}Running: wix publish${NC}"
    wix publish
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully published to Wix!${NC}"
    else
        echo -e "${RED}❌ Publish failed. Check errors above.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Wix CLI command not found. Using manual deployment.${NC}"
    echo ""
    echo -e "${BLUE}📋 Manual Deployment Steps:${NC}"
    echo "1. Open Wix Editor: https://editor.wix.com"
    echo "2. Go to Dev Mode"
    echo "3. Upload backend functions from: src/backend/"
    echo "4. Embed HTML pages:"
    echo "   - Charter Page: public/pages/charter-page-final.html"
    echo "   - Mission Support: public/pages/mission-support-form.html"
    echo "5. Configure secrets in Secrets Manager"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Verify files are uploaded in Wix Editor"
echo "2. Configure secrets in Wix Secrets Manager"
echo "3. Test crypto payment buttons"
echo "4. Test Mission Support form"
echo "5. Verify database sync"

echo ""
echo -e "${GREEN}🎉 Ready for testing!${NC}"

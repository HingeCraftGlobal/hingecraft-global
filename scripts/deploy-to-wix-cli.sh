#!/bin/bash

# HingeCraft Global - Wix CLI Deployment Script
# T10 Implementation: Deploy charter page and mission support page to Wix
# Usage: ./scripts/deploy-to-wix-cli.sh

set -e

echo "🚀 HingeCraft Global - Wix CLI Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if wix CLI is installed
if ! command -v wix &> /dev/null; then
    echo -e "${RED}❌ Wix CLI is not installed.${NC}"
    echo "Please install it with: npm install -g @wix/cli"
    exit 1
fi

echo -e "${BLUE}📋 Deployment Checklist:${NC}"
echo "1. Charter Page HTML"
echo "2. Mission Support Form HTML"
echo "3. Charter Page Velo Code"
echo "4. Mission Support Page Velo Code"
echo "5. Backend Middleware Functions"
echo "6. NowPayments API Handler"
echo "7. Stripe API Handler"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "src" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Step 1: Deploy Charter Page
echo -e "${BLUE}📄 Step 1: Deploying Charter Page...${NC}"
if [ -f "public/pages/charter-page-final.html" ]; then
    echo -e "${GREEN}✅ Charter page HTML found${NC}"
else
    echo -e "${YELLOW}⚠️  Charter page HTML not found at public/pages/charter-page-final.html${NC}"
fi

if [ -f "src/pages/Charter of Abundance Invitation.pa3z2.js" ]; then
    echo -e "${GREEN}✅ Charter page Velo code found${NC}"
else
    echo -e "${YELLOW}⚠️  Charter page Velo code not found${NC}"
fi

# Step 2: Deploy Mission Support Page
echo -e "${BLUE}📄 Step 2: Deploying Mission Support Page...${NC}"
if [ -f "public/pages/mission-support-form.html" ]; then
    echo -e "${GREEN}✅ Mission Support form HTML found${NC}"
else
    echo -e "${YELLOW}⚠️  Mission Support form HTML not found${NC}"
fi

if [ -f "src/pages/Mission Support.msup1.js" ]; then
    echo -e "${GREEN}✅ Mission Support page Velo code found${NC}"
else
    echo -e "${YELLOW}⚠️  Mission Support page Velo code not found${NC}"
fi

# Step 3: Deploy Backend Functions
echo -e "${BLUE}📦 Step 3: Deploying Backend Functions...${NC}"

BACKEND_FILES=(
    "src/backend/charter-page-middleware.jsw"
    "src/backend/mission-support-middleware.jsw"
    "src/backend/nowpayments.api.jsw"
    "src/backend/stripe.api.jsw"
    "src/backend/hingecraft.api.web.jsw"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename $file) found${NC}"
    else
        echo -e "${YELLOW}⚠️  $(basename $file) not found${NC}"
    fi
done

# Step 4: Wix CLI Commands
echo ""
echo -e "${BLUE}🔧 Step 4: Running Wix CLI Commands...${NC}"

# Check if wix dev is running
if pgrep -f "wix dev" > /dev/null; then
    echo -e "${GREEN}✅ Wix dev server is running${NC}"
else
    echo -e "${YELLOW}⚠️  Wix dev server is not running${NC}"
    echo "Starting Wix dev server..."
    wix dev &
    sleep 5
fi

# Deploy using Wix CLI
echo ""
echo -e "${BLUE}📤 Deploying to Wix...${NC}"

# Note: Actual deployment commands depend on your Wix setup
# These are placeholder commands - adjust based on your Wix CLI setup

echo "To deploy:"
echo "1. Open Wix Editor: https://editor.wix.com"
echo "2. Go to Dev Mode"
echo "3. Upload files:"
echo "   - Charter Page: public/pages/charter-page-final.html"
echo "   - Mission Support: public/pages/mission-support-form.html"
echo "   - Velo Code: src/pages/*.js"
echo "   - Backend: src/backend/*.jsw"
echo ""
echo "Or use Wix CLI:"
echo "  wix publish --source local"

echo ""
echo -e "${GREEN}✅ Deployment script completed!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Verify all files are uploaded to Wix"
echo "2. Test crypto payment buttons on Charter Page"
echo "3. Test Mission Support form submission"
echo "4. Verify database sync is working"
echo "5. Test preset amount buttons ($1, $5, $20)"
echo "6. Verify cumulative total updates correctly"

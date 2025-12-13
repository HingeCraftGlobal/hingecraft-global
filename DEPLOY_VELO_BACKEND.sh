#!/bin/bash
# Deploy Velo Backend Functions to Wix via CLI
# This script manages Wix dev mode and prepares backend for deployment
# Usage: ./DEPLOY_VELO_BACKEND.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 HINGECRAFT - VELO BACKEND DEPLOYMENT (WIX CLI)"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check Wix CLI
if ! command -v wix &> /dev/null; then
    echo -e "${RED}❌ Wix CLI not found${NC}"
    exit 1
fi

# Check authentication
echo -e "${BLUE}📋 Checking authentication...${NC}"
if ! wix whoami &> /dev/null; then
    echo -e "${RED}❌ Not authenticated. Run: wix login${NC}"
    exit 1
fi

USER=$(wix whoami | head -1)
echo -e "${GREEN}✅ Authenticated as: $USER${NC}"
echo ""

# Stop any existing Wix Dev processes
echo -e "${BLUE}📋 Managing Wix Dev Mode...${NC}"
if pgrep -f "wix dev" > /dev/null; then
    echo -e "${YELLOW}⚠️  Stopping existing Wix dev processes...${NC}"
    pkill -f "wix dev" 2>/dev/null || true
    sleep 2
fi

# Start fresh Wix Dev Mode
echo -e "${BLUE}📋 Starting fresh Wix Dev Mode...${NC}"
nohup wix dev > /tmp/wix_dev_velo.log 2>&1 &
WIX_DEV_PID=$!
sleep 5

if ps -p $WIX_DEV_PID > /dev/null 2>&1 || pgrep -f "wix dev" > /dev/null; then
    echo -e "${GREEN}✅ Wix dev started successfully${NC}"
    echo -e "${BLUE}   PID: $WIX_DEV_PID${NC}"
    echo -e "${BLUE}   Log: /tmp/wix_dev_velo.log${NC}"
else
    echo -e "${RED}❌ Wix dev failed to start${NC}"
    exit 1
fi

echo ""

# Verify backend files
echo -e "${BLUE}📋 Verifying Backend Functions (8 total)...${NC}"

BACKEND_FILES=(
    "src/backend/payment-info-service.jsw"
    "src/backend/mission-support-middleware.jsw"
    "src/backend/charter-page-middleware.jsw"
    "src/backend/stripe.api.jsw"
    "src/backend/nowpayments.api.jsw"
    "src/backend/chat-notifications.jsw"
    "src/backend/gpt-form-config.jsw"
    "src/backend/receipts-hook.jsw"
)

MISSING=0
for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(wc -c < "$file" | tr -d ' ')
        echo -e "${GREEN}✅ $(basename $file)${NC} (${SIZE} bytes)"
    else
        echo -e "${RED}❌ $(basename $file) NOT FOUND${NC}"
        MISSING=1
    fi
done

if [ $MISSING -eq 1 ]; then
    echo -e "${RED}❌ Missing backend files!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All 8 backend functions verified${NC}"
echo ""

# Verify page-level code
echo -e "${BLUE}📋 Verifying Page-Level Code...${NC}"

PAGE_FILES=(
    "src/pages/Charter of Abundance Invitation.pa3z2.js"
    "src/pages/Payment.xf66z.js"
    "src/pages/Mission Support.b6v8z.js"
    "src/pages/masterPage.js"
)

for file in "${PAGE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename $file)${NC}"
    else
        echo -e "${YELLOW}⚠️  $(basename $file) not found${NC}"
    fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📤 WIX CLI BACKEND DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Wix CLI manages backend code through git integration.${NC}"
echo ""
echo -e "${YELLOW}Note:${NC} Backend functions (.jsw files) must be uploaded via Wix Editor:"
echo ""
echo "1. Open Wix Editor: https://editor.wix.com"
echo "2. Enable Dev Mode"
echo "3. Go to: Backend → Functions"
echo "4. Upload these files (in order):"
for i in "${!BACKEND_FILES[@]}"; do
    num=$((i+1))
    echo "   $num. $(basename "${BACKEND_FILES[$i]}")"
done
echo ""
echo -e "${BLUE}Wix Dev Mode:${NC} Running (PID: $WIX_DEV_PID)"
echo -e "${BLUE}Log File:${NC} /tmp/wix_dev_velo.log"
echo ""
echo -e "${GREEN}✅ Ready for backend deployment!${NC}"
echo ""
echo -e "${BLUE}📚 Wix Velo API:${NC} https://www.wix.com/velo/reference/api-overview/introduction"
echo ""

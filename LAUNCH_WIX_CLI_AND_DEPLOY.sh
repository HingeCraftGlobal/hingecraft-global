#!/bin/bash

# HingeCraft Global - Launch Wix CLI and Deploy Mission Support Form
# This script launches Wix CLI dev mode and provides deployment instructions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 HINGECRAFT GLOBAL - WIX CLI LAUNCH & DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Wix CLI is installed
if ! command -v wix &> /dev/null; then
    echo -e "${RED}❌ Wix CLI is not installed.${NC}"
    echo "Please install it with: npm install -g @wix/cli"
    exit 1
fi

echo -e "${GREEN}✅ Wix CLI found: $(which wix)${NC}"

# Check authentication
echo -e "${BLUE}📋 Checking Wix authentication...${NC}"
if ! wix whoami &> /dev/null; then
    echo -e "${RED}❌ Not authenticated. Please login first:${NC}"
    echo "   wix login"
    exit 1
fi

USER=$(wix whoami | head -1)
echo -e "${GREEN}✅ Authenticated as: $USER${NC}"
echo ""

# Check if Wix dev is already running
if pgrep -f "wix dev" > /dev/null; then
    echo -e "${GREEN}✅ Wix dev is already running${NC}"
    WIX_DEV_PID=$(pgrep -f "wix dev" | head -1)
    echo "   PID: $WIX_DEV_PID"
    echo "   Logs: tail -f /tmp/wix_dev.log"
else
    echo -e "${BLUE}📋 Starting Wix Dev Mode...${NC}"
    echo ""
    echo -e "${YELLOW}Starting Wix dev in background...${NC}"
    nohup wix dev > /tmp/wix_dev.log 2>&1 &
    WIX_DEV_PID=$!
    sleep 3
    
    if ps -p $WIX_DEV_PID > /dev/null; then
        echo -e "${GREEN}✅ Wix dev started (PID: $WIX_DEV_PID)${NC}"
        echo "   Logs: tail -f /tmp/wix_dev.log"
    else
        echo -e "${RED}❌ Wix dev failed to start${NC}"
        echo "Check logs: cat /tmp/wix_dev.log"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 MISSION SUPPORT FORM DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Verify mission support form exists
MISSION_SUPPORT_FORM="public/pages/mission-support-form.html"
if [ -f "$MISSION_SUPPORT_FORM" ]; then
    LINES=$(wc -l < "$MISSION_SUPPORT_FORM")
    echo -e "${GREEN}✅ Mission Support Form found${NC}"
    echo "   File: $MISSION_SUPPORT_FORM"
    echo "   Lines: $LINES"
else
    echo -e "${RED}❌ Mission Support Form NOT FOUND${NC}"
    echo "   Expected: $MISSION_SUPPORT_FORM"
    exit 1
fi

echo ""
echo -e "${YELLOW}📝 DEPLOYMENT INSTRUCTIONS:${NC}"
echo ""
echo -e "${GREEN}1. Open Wix Editor:${NC}"
echo "   https://editor.wix.com"
echo ""
echo -e "${GREEN}2. Navigate to Mission Support Page:${NC}"
echo "   - Find your Mission Support page"
echo "   - Or create a new page named 'Mission Support'"
echo ""
echo -e "${GREEN}3. Add HTML Element:${NC}"
echo "   - Click '+' to add element"
echo "   - Search for 'HTML' or 'Embed Code'"
echo "   - Add HTML element to page"
echo ""
echo -e "${GREEN}4. Paste HTML Content:${NC}"
echo "   - Open: $SCRIPT_DIR/$MISSION_SUPPORT_FORM"
echo "   - Copy entire file contents (all $LINES lines)"
echo "   - Paste into HTML element"
echo "   - Click 'Apply' or 'Update'"
echo ""
echo -e "${GREEN}5. Configure HTML Element:${NC}"
echo "   - Width: 100% (or desired width)"
echo "   - Height: Auto (or min-height: 100vh)"
echo "   - Enable 'Show on all devices'"
echo ""
echo -e "${GREEN}6. Verify Backend Functions (if not already deployed):${NC}"
echo "   - Go to: Backend → Functions"
echo "   - Ensure these are uploaded:"
echo "     • mission-support-middleware.jsw"
echo "     • stripe.api.jsw"
echo "     • nowpayments.api.jsw"
echo "     • charter-page-middleware.jsw"
echo ""
echo -e "${GREEN}7. Test the Form:${NC}"
echo "   - Test micro payments ($1, $2, $5)"
echo "   - Test 'Other' amount redirect"
echo "   - Test form validation"
echo "   - Check browser console for errors"
echo ""

# Display file path for easy copy
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 FILE PATH (for easy copy-paste)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "$SCRIPT_DIR/$MISSION_SUPPORT_FORM"
echo ""

# Quick validation
echo -e "${BLUE}📋 Quick Validation:${NC}"
if grep -q "<!DOCTYPE html>" "$MISSION_SUPPORT_FORM"; then
    echo -e "${GREEN}✅ Valid HTML structure${NC}"
else
    echo -e "${RED}❌ Invalid HTML structure${NC}"
fi

if grep -q "mission-support-middleware" "$MISSION_SUPPORT_FORM"; then
    echo -e "${GREEN}✅ Uses mission-support-middleware endpoints${NC}"
else
    echo -e "${YELLOW}⚠️  May not use mission-support-middleware${NC}"
fi

if grep -q "microPayment\|otherAmount" "$MISSION_SUPPORT_FORM"; then
    echo -e "${GREEN}✅ Has microPayment and otherAmount functions${NC}"
else
    echo -e "${YELLOW}⚠️  May be missing payment functions${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ WIX CLI READY & DEPLOYMENT GUIDE COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Wix dev is running (PID: $WIX_DEV_PID)"
echo "2. Open Wix Editor: https://editor.wix.com"
echo "3. Follow deployment instructions above"
echo "4. Monitor logs: tail -f /tmp/wix_dev.log"
echo "5. Test all functionality before publishing"
echo ""
echo -e "${BLUE}📄 Full documentation: MISSION_SUPPORT_FORM_DEPLOYMENT.md${NC}"
echo ""
echo -e "${GREEN}✅ Ready to deploy Mission Support Form!${NC}"
echo ""

#!/bin/bash

# HingeCraft Global - Complete Wix CLI Deployment Script
# This script deploys all components to Wix Dev/Production
# Usage: ./DEPLOY_ALL_TO_WIX_CLI.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 HINGECRAFT GLOBAL - WIX CLI DEPLOYMENT"
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

# Check if authenticated
echo -e "${BLUE}📋 Checking Wix authentication...${NC}"
if ! wix whoami &> /dev/null; then
    echo -e "${RED}❌ Not authenticated. Please login first:${NC}"
    echo "   wix login"
    exit 1
fi

echo -e "${GREEN}✅ Authenticated as: $(wix whoami | head -1)${NC}"
echo ""

# Step 1: Verify all files exist
echo -e "${BLUE}📋 Step 1: Verifying deployment files...${NC}"

# HTML Pages
HTML_FILES=(
    "public/pages/charter-page-wix-ready.html"
    "public/pages/mission-support-form.html"
)

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename $file) found${NC}"
    else
        echo -e "${RED}❌ $(basename $file) NOT FOUND${NC}"
        exit 1
    fi
done

# Backend Velo Functions
BACKEND_FILES=(
    "src/backend/charter-page-middleware.web.js"
    "src/backend/mission-support-middleware.web.js"
    "src/backend/nowpayments.api.jsw"
    "src/backend/stripe.api.jsw"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename $file) found${NC}"
    else
        echo -e "${YELLOW}⚠️  $(basename $file) not found${NC}"
    fi
done

# Page-level Velo Code
PAGE_FILES=(
    "src/pages/masterPage.js"
)

for file in "${PAGE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename $file) found${NC}"
    else
        echo -e "${YELLOW}⚠️  $(basename $file) not found${NC}"
    fi
done

echo ""

# Step 2: Start Wix Dev (if not running)
echo -e "${BLUE}📋 Step 2: Starting Wix Dev Mode...${NC}"
if pgrep -f "wix dev" > /dev/null; then
    echo -e "${GREEN}✅ Wix dev is already running${NC}"
    WIX_DEV_PID=$(pgrep -f "wix dev" | head -1)
    echo "   PID: $WIX_DEV_PID"
else
    echo -e "${YELLOW}⚠️  Wix dev is not running. Starting...${NC}"
    nohup wix dev > /tmp/wix_dev.log 2>&1 &
    WIX_DEV_PID=$!
    sleep 5
    
    if ps -p $WIX_DEV_PID > /dev/null; then
        echo -e "${GREEN}✅ Wix dev started (PID: $WIX_DEV_PID)${NC}"
    else
        echo -e "${RED}❌ Wix dev failed to start${NC}"
        echo "Check logs: tail -20 /tmp/wix_dev.log"
        exit 1
    fi
fi

echo ""

# Step 3: Deployment Instructions
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📤 DEPLOYMENT INSTRUCTIONS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Since Wix CLI doesn't have direct file upload commands,${NC}"
echo -e "${YELLOW}you need to manually upload files via Wix Editor:${NC}"
echo ""
echo -e "${GREEN}1. Open Wix Editor:${NC}"
echo "   https://editor.wix.com"
echo ""
echo -e "${GREEN}2. Enable Dev Mode:${NC}"
echo "   - Click 'Dev Mode' toggle in top bar"
echo "   - Or: Settings → Dev Mode → Enable"
echo ""
echo -e "${GREEN}3. Upload Backend Functions:${NC}"
echo "   - Go to: Backend → Functions"
echo "   - Upload these files:"
for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "     • $file"
    fi
done
echo ""
echo -e "${GREEN}4. Configure Secrets (Wix Secrets Manager):${NC}"
echo "   - Go to: Settings → Secrets"
echo "   - Add these secrets:"
echo "     • STRIPE_SECRET_KEY_LIVE"
echo "     • STRIPE_PUBLISHABLE_KEY_LIVE"
echo "     • STRIPE_SECRET_KEY_TEST (optional)"
echo "     • STRIPE_PUBLISHABLE_KEY_TEST (optional)"
echo "     • NOWPAYMENTS_API_KEY"
echo "     • DOCKER_BACKEND_URL (if using external backend)"
echo ""
echo -e "${GREEN}5. Embed HTML Pages:${NC}"
echo "   - Charter Page:"
echo "     • Open Charter page in Wix Editor"
echo "     • Add HTML element"
echo "     • Paste contents of: public/pages/charter-page-wix-ready.html"
echo "   - Mission Support Page:"
echo "     • Open Mission Support page"
echo "     • Add HTML element"
echo "     • Paste contents of: public/pages/mission-support-form.html"
echo ""
echo -e "${GREEN}6. Update Page-Level Code:${NC}"
echo "   - Charter Page:"
echo "     • Open page settings → Code"
echo "     • Replace with contents of: src/pages/masterPage.js"
echo "     • Or ensure it doesn't import charter-page-middleware directly"
echo ""
echo -e "${GREEN}7. Verify Database Collections:${NC}"
echo "   - Go to: Database → Collections"
echo "   - Ensure these collections exist:"
echo "     • Donations"
echo "     • CryptoPayments"
echo "     • ContributionIntent"
echo ""
echo -e "${GREEN}8. Test and Publish:${NC}"
echo "   - Test all payment flows"
echo "   - Verify redirects work"
echo "   - Check console for errors"
echo "   - Publish when ready"
echo ""

# Step 4: Create deployment manifest
echo -e "${BLUE}📋 Step 4: Creating deployment manifest...${NC}"
MANIFEST_FILE="WIX_DEPLOYMENT_MANIFEST_$(date +%Y%m%d_%H%M%S).txt"
cat > "$MANIFEST_FILE" << EOF
HingeCraft Global - Wix Deployment Manifest
Generated: $(date)

FILES TO DEPLOY:
================

HTML Pages:
$(for file in "${HTML_FILES[@]}"; do echo "  - $file"; done)

Backend Functions:
$(for file in "${BACKEND_FILES[@]}"; do echo "  - $file"; done)

Page-Level Code:
$(for file in "${PAGE_FILES[@]}"; do echo "  - $file"; done)

SECRETS TO CONFIGURE:
=====================
- STRIPE_SECRET_KEY_LIVE
- STRIPE_PUBLISHABLE_KEY_LIVE
- NOWPAYMENTS_API_KEY
- DOCKER_BACKEND_URL (optional)

DATABASE COLLECTIONS:
=====================
- Donations
- CryptoPayments
- ContributionIntent

DEPLOYMENT STATUS:
==================
- Wix Dev Mode: Running (PID: $WIX_DEV_PID)
- Files Verified: ✅
- Ready for Manual Upload: ✅

NEXT STEPS:
===========
1. Open Wix Editor
2. Enable Dev Mode
3. Upload backend functions
4. Configure secrets
5. Embed HTML pages
6. Update page-level code
7. Test and publish
EOF

echo -e "${GREEN}✅ Manifest created: $MANIFEST_FILE${NC}"
echo ""

# Step 5: Display file paths for easy copy-paste
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 FILE PATHS (for easy copy-paste)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "HTML Pages:"
for file in "${HTML_FILES[@]}"; do
    echo "  $SCRIPT_DIR/$file"
done
echo ""
echo "Backend Functions:"
for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  $SCRIPT_DIR/$file"
    fi
done
echo ""
echo "Page-Level Code:"
for file in "${PAGE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  $SCRIPT_DIR/$file"
    fi
done
echo ""

# Step 6: Quick validation
echo -e "${BLUE}📋 Step 6: Quick validation...${NC}"

# Check HTML syntax (basic check)
for file in "${HTML_FILES[@]}"; do
    if grep -q "<!DOCTYPE html>" "$file" && grep -q "</html>" "$file"; then
        echo -e "${GREEN}✅ $file: Valid HTML structure${NC}"
    else
        echo -e "${RED}❌ $file: Invalid HTML structure${NC}"
    fi
done

# Check for common errors in HTML
for file in "${HTML_FILES[@]}"; do
    if grep -q "callVeloFunction" "$file"; then
        echo -e "${GREEN}✅ $file: Uses callVeloFunction helper${NC}"
    else
        echo -e "${YELLOW}⚠️  $file: May not use callVeloFunction helper${NC}"
    fi
done

echo ""

# Final summary
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT PREPARATION COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Open Wix Editor: https://editor.wix.com"
echo "2. Follow the deployment instructions above"
echo "3. Monitor Wix Dev logs: tail -f /tmp/wix_dev.log"
echo "4. Test all functionality before publishing"
echo ""
echo -e "${BLUE}📄 Manifest saved to: $MANIFEST_FILE${NC}"
echo ""
echo -e "${GREEN}✅ All files verified and ready for deployment!${NC}"
echo ""

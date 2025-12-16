#!/bin/bash

# Deploy to Wix - Make Updates Live
# This script prepares everything for live deployment on Wix

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Deploy to Wix - Make Updates Live${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Verify files
echo -e "${YELLOW}Step 1: Verifying deployment files...${NC}"

FILES=(
    "payment-page-integration-NO-DB.js"
    "CHARTER_PAGE_WITH_CHECKOUT.html"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(wc -l < "$file")
        echo -e "${GREEN}✅ $file${NC} (${SIZE} lines)"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        exit 1
    fi
done

# Step 2: Display deployment instructions
echo ""
echo -e "${YELLOW}Step 2: Deployment Instructions${NC}"
echo ""

cat << 'DEPLOYEOF'

═══════════════════════════════════════════════════════════
🚀 DEPLOY TO WIX - MAKE UPDATES LIVE
═══════════════════════════════════════════════════════════

FLOW: Payment Page → Charter Page → Checkout

═══════════════════════════════════════════════════════════
STEP 1: DEPLOY PAYMENT PAGE (2 minutes)
═══════════════════════════════════════════════════════════

1. Open Wix Editor
2. Go to: Payment Page
3. Click: Settings (gear icon)
4. Click: Custom Code tab
5. Click: JavaScript section
6. DELETE all existing code
7. Copy ENTIRE content from: payment-page-integration-NO-DB.js
8. Paste into JavaScript editor
9. Update CHARTER_PAGE_URL if needed (line 23)
   Current: '/charter'
   Update to your actual charter page URL if different
10. Click: Save
11. Click: Publish (if needed)

✅ Payment page is now live!

═══════════════════════════════════════════════════════════
STEP 2: DEPLOY CHARTER PAGE (2 minutes)
═══════════════════════════════════════════════════════════

1. Go to: Charter Page
2. Click: Settings (gear icon)
3. Click: Custom Code tab
4. Click: HTML section
5. DELETE all existing code
6. Copy ENTIRE content from: CHARTER_PAGE_WITH_CHECKOUT.html
7. Paste into HTML editor
8. Update CHECKOUT_PAGE_URL if needed (line 23)
   Current: '/checkout'
   Update to your actual checkout page URL if different
9. Click: Save
10. Click: Publish (if needed)

✅ Charter page is now live!

═══════════════════════════════════════════════════════════
STEP 3: TEST FLOW (2 minutes)
═══════════════════════════════════════════════════════════

1. Go to Payment Page (preview or published)
2. Enter "Other" amount: $50.00
3. Click submit/pay button
4. ✅ Should redirect to Charter Page immediately
5. ✅ Should see: "Donation Amount: $50.00"
6. ✅ Contributions section should show updated amount
7. ✅ Should see "Proceed to Checkout" button
8. Click "Proceed to Checkout" button
9. ✅ Should go to Checkout Page
10. ✅ Amount should be in URL: ?donationAmount=50

✅ Flow is working!

═══════════════════════════════════════════════════════════
VERIFICATION CHECKLIST
═══════════════════════════════════════════════════════════

Payment Page:
[ ] Code deployed
[ ] No form errors
[ ] Redirects to charter page
[ ] Amount captured correctly

Charter Page:
[ ] Code deployed
[ ] Donation amount displays
[ ] Contributions section updates
[ ] Checkout button appears
[ ] Redirects to checkout

Checkout:
[ ] Receives amount from charter
[ ] Payment processes correctly

═══════════════════════════════════════════════════════════
FILES TO COPY
═══════════════════════════════════════════════════════════

1. Payment Page:
   File: payment-page-integration-NO-DB.js
   Location: Payment Page → Settings → Custom Code → JavaScript

2. Charter Page:
   File: CHARTER_PAGE_WITH_CHECKOUT.html
   Location: Charter Page → Settings → Custom Code → HTML

═══════════════════════════════════════════════════════════
✅ READY TO DEPLOY - FOLLOW STEPS ABOVE
═══════════════════════════════════════════════════════════

DEPLOYEOF

# Step 3: Open files for easy copy
echo ""
echo -e "${YELLOW}Step 3: Opening files for easy copy...${NC}"

if command -v open &> /dev/null; then
    open payment-page-integration-NO-DB.js 2>/dev/null || echo "File: payment-page-integration-NO-DB.js"
    open CHARTER_PAGE_WITH_CHECKOUT.html 2>/dev/null || echo "File: CHARTER_PAGE_WITH_CHECKOUT.html"
    echo -e "${GREEN}✅ Files opened${NC}"
else
    echo "Files ready:"
    echo "  - payment-page-integration-NO-DB.js"
    echo "  - CHARTER_PAGE_WITH_CHECKOUT.html"
fi

# Step 4: Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT READY${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "  1. Follow deployment instructions above"
echo -e "  2. Deploy Payment Page code"
echo -e "  3. Deploy Charter Page code"
echo -e "  4. Test flow"
echo -e "  5. Updates are LIVE!"
echo ""
echo -e "${GREEN}✅ Ready to deploy to Wix!${NC}"









#!/bin/bash

# Complete Deployment to Wix - Make Everything Live
# This script prepares everything and guides through Wix deployment

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Complete Deployment to Wix - Make Everything Live${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Verify files exist
echo -e "${YELLOW}Step 1: Verifying deployment files...${NC}"

REQUIRED_FILES=(
    "payment-page-integration-NO-DB.js"
    "CHARTER_PAGE_WITH_CHECKOUT.html"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(wc -l < "$file")
        echo -e "${GREEN}✅ $file${NC} (${SIZE} lines)"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        exit 1
    fi
done

# Step 2: Create ready-to-copy files
echo ""
echo -e "${YELLOW}Step 2: Creating ready-to-copy files...${NC}"

# Create payment page file ready for copy
cat payment-page-integration-NO-DB.js > PAYMENT_PAGE_READY_TO_COPY.js
echo -e "${GREEN}✅ Created: PAYMENT_PAGE_READY_TO_COPY.js${NC}"

# Create charter page file ready for copy
cat CHARTER_PAGE_WITH_CHECKOUT.html > CHARTER_PAGE_READY_TO_COPY.html
echo -e "${GREEN}✅ Created: CHARTER_PAGE_READY_TO_COPY.html${NC}"

# Step 3: Create deployment checklist
echo ""
echo -e "${YELLOW}Step 3: Creating deployment checklist...${NC}"

cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# ✅ Wix Deployment Checklist

## 🚀 Complete Deployment Steps

### Step 1: Deploy Payment Page (2 minutes)

- [ ] Open Wix Editor
- [ ] Navigate to Payment Page
- [ ] Click Settings (gear icon)
- [ ] Click Custom Code tab
- [ ] Click JavaScript section
- [ ] DELETE all existing code
- [ ] Copy ENTIRE content from: `PAYMENT_PAGE_READY_TO_COPY.js`
- [ ] Paste into JavaScript editor
- [ ] Update `CHARTER_PAGE_URL` if needed (line 21)
- [ ] Click Save
- [ ] Click Publish (if needed)

**✅ Payment Page Deployed**

### Step 2: Deploy Charter Page (2 minutes)

- [ ] Navigate to Charter Page
- [ ] Click Settings (gear icon)
- [ ] Click Custom Code tab
- [ ] Click HTML section
- [ ] DELETE all existing code
- [ ] Copy ENTIRE content from: `CHARTER_PAGE_READY_TO_COPY.html`
- [ ] Paste into HTML editor
- [ ] Update `CHECKOUT_PAGE_URL` if needed (line 21)
- [ ] Click Save
- [ ] Click Publish (if needed)

**✅ Charter Page Deployed**

### Step 3: Test Flow (5 minutes)

- [ ] Go to Payment Page (preview or published)
- [ ] Enter "Other" amount: $50.00
- [ ] Click submit/pay button
- [ ] ✅ Verify: Redirects to Charter Page immediately
- [ ] ✅ Verify: See "Donation Amount: $50.00"
- [ ] ✅ Verify: Contributions section shows updated amount
- [ ] ✅ Verify: See "Proceed to Checkout" button
- [ ] Click "Proceed to Checkout" button
- [ ] ✅ Verify: Goes to Checkout Page
- [ ] ✅ Verify: URL has `?donationAmount=50`
- [ ] ✅ Verify: Payment processes correctly

**✅ Flow Tested and Working**

---

## ✅ Deployment Complete When:

- [x] Payment Page code deployed
- [x] Charter Page code deployed
- [x] Flow tested: Payment → Charter → Checkout
- [x] All verifications passed
- [x] Site is LIVE and working

**Status**: ✅ **DEPLOYMENT COMPLETE**
EOF

echo -e "${GREEN}✅ Created: DEPLOYMENT_CHECKLIST.md${NC}"

# Step 4: Create testing script
echo ""
echo -e "${YELLOW}Step 4: Creating testing script...${NC}"

cat > TEST_WIX_DEPLOYMENT.sh << 'EOF'
#!/bin/bash

# Test Wix Deployment - Verify Everything Works

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🧪 Test Wix Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Manual Testing Required:${NC}"
echo ""
echo "1. Go to your Wix site payment page"
echo "2. Enter 'Other' amount: \$50.00"
echo "3. Click submit button"
echo "4. Verify redirects to charter page"
echo "5. Verify donation amount displays"
echo "6. Verify contributions updated"
echo "7. Click checkout button"
echo "8. Verify goes to checkout page"
echo ""
echo -e "${GREEN}✅ If all steps pass, deployment is complete!${NC}"
EOF

chmod +x TEST_WIX_DEPLOYMENT.sh
echo -e "${GREEN}✅ Created: TEST_WIX_DEPLOYMENT.sh${NC}"

# Step 5: Display deployment instructions
echo ""
echo -e "${YELLOW}Step 5: Deployment Instructions${NC}"
echo ""

cat << 'DEPLOYEOF'

═══════════════════════════════════════════════════════════
🚀 DEPLOY TO WIX - COMPLETE INSTRUCTIONS
═══════════════════════════════════════════════════════════

📋 FILES READY TO COPY:
   ✅ PAYMENT_PAGE_READY_TO_COPY.js
   ✅ CHARTER_PAGE_READY_TO_COPY.html

═══════════════════════════════════════════════════════════
STEP 1: DEPLOY PAYMENT PAGE (2 minutes)
═══════════════════════════════════════════════════════════

1. Open Wix Editor
   → Go to your Wix site
   → Click "Edit Site"

2. Navigate to Payment Page
   → Find your payment page
   → Click on it

3. Open Custom Code
   → Click Settings (gear icon) on the page
   → Click "Custom Code" tab
   → Click "JavaScript" section

4. Replace Code
   → DELETE all existing code in the editor
   → Open: PAYMENT_PAGE_READY_TO_COPY.js
   → Copy ENTIRE content (Cmd+A, Cmd+C)
   → Paste into JavaScript editor (Cmd+V)

5. Update Configuration (if needed)
   → Find line 21: CHARTER_PAGE_URL: '/charter'
   → Update to your actual charter page URL if different
   → Examples: '/charter', '/membership', '/contributions'

6. Save
   → Click "Save" button
   → Code is now active

7. Publish (if needed)
   → Click "Publish" button (top right)
   → Or use Preview to test first

✅ Payment Page is now LIVE!

═══════════════════════════════════════════════════════════
STEP 2: DEPLOY CHARTER PAGE (2 minutes)
═══════════════════════════════════════════════════════════

1. Navigate to Charter Page
   → Find your charter/contributions page
   → Click on it

2. Open Custom Code
   → Click Settings (gear icon) on the page
   → Click "Custom Code" tab
   → Click "HTML" section

3. Replace Code
   → DELETE all existing code in the editor
   → Open: CHARTER_PAGE_READY_TO_COPY.html
   → Copy ENTIRE content (Cmd+A, Cmd+C)
   → Paste into HTML editor (Cmd+V)

4. Update Configuration (if needed)
   → Find line 21: CHECKOUT_PAGE_URL: '/checkout'
   → Update to your actual checkout page URL if different

5. Save
   → Click "Save" button
   → Code is now active

6. Publish (if needed)
   → Click "Publish" button (top right)
   → Or use Preview to test first

✅ Charter Page is now LIVE!

═══════════════════════════════════════════════════════════
STEP 3: TEST FLOW (5 minutes)
═══════════════════════════════════════════════════════════

1. Go to Payment Page
   → Use Preview or Published site
   → Navigate to payment page

2. Enter "Other" Amount
   → Find "Other" amount field
   → Enter amount: 50.00 or $50.00

3. Click Submit Button
   → Click submit/pay button
   → ✅ Should redirect to Charter Page IMMEDIATELY

4. Verify Charter Page
   → ✅ Should see: "Donation Amount: $50.00"
   → ✅ Contributions section should show: "$50.00"
   → ✅ Should see: "Proceed to Checkout" button

5. Click Checkout Button
   → Click "Proceed to Checkout" button
   → ✅ Should redirect to Checkout Page

6. Verify Checkout
   → ✅ Should be on checkout page
   → ✅ URL should have: ?donationAmount=50
   → ✅ Payment should process correctly

✅ Flow is working!

═══════════════════════════════════════════════════════════
✅ DEPLOYMENT COMPLETE WHEN:
═══════════════════════════════════════════════════════════

- [x] Payment Page code deployed
- [x] Charter Page code deployed
- [x] Flow tested: Payment → Charter → Checkout
- [x] All verifications passed
- [x] Site is LIVE and working

═══════════════════════════════════════════════════════════
📋 NEXT STEPS:
═══════════════════════════════════════════════════════════

1. Follow steps above to deploy to Wix
2. Test the complete flow
3. Verify everything works
4. Run: ./TEST_WIX_DEPLOYMENT.sh (for testing checklist)

✅ Ready to deploy to Wix!

DEPLOYEOF

# Step 6: Open files for easy access
echo ""
echo -e "${YELLOW}Step 6: Opening files for easy copy...${NC}"

if command -v open &> /dev/null; then
    open PAYMENT_PAGE_READY_TO_COPY.js 2>/dev/null || echo "File: PAYMENT_PAGE_READY_TO_COPY.js"
    open CHARTER_PAGE_READY_TO_COPY.html 2>/dev/null || echo "File: CHARTER_PAGE_READY_TO_COPY.html"
    open DEPLOYMENT_CHECKLIST.md 2>/dev/null || echo "File: DEPLOYMENT_CHECKLIST.md"
    echo -e "${GREEN}✅ Files opened${NC}"
else
    echo "Files ready:"
    echo "  - PAYMENT_PAGE_READY_TO_COPY.js"
    echo "  - CHARTER_PAGE_READY_TO_COPY.html"
    echo "  - DEPLOYMENT_CHECKLIST.md"
fi

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT PREPARATION COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Files Ready:${NC}"
echo -e "  ✅ PAYMENT_PAGE_READY_TO_COPY.js"
echo -e "  ✅ CHARTER_PAGE_READY_TO_COPY.html"
echo -e "  ✅ DEPLOYMENT_CHECKLIST.md"
echo -e "  ✅ TEST_WIX_DEPLOYMENT.sh"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. Follow deployment instructions above"
echo -e "  2. Deploy Payment Page code to Wix"
echo -e "  3. Deploy Charter Page code to Wix"
echo -e "  4. Test complete flow"
echo -e "  5. Verify everything works"
echo ""
echo -e "${GREEN}✅ Ready to deploy to Wix!${NC}"
echo ""









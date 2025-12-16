#!/bin/bash

# Verify Deployment Complete - Check Everything is Live

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}✅ Verify Deployment Complete${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Deployment Verification Checklist:${NC}"
echo ""

# Check files exist
echo -e "${BLUE}📦 Files Ready:${NC}"
if [ -f "PAYMENT_PAGE_READY_TO_COPY.js" ]; then
    echo -e "${GREEN}✅ PAYMENT_PAGE_READY_TO_COPY.js${NC}"
else
    echo -e "${RED}❌ PAYMENT_PAGE_READY_TO_COPY.js missing${NC}"
fi

if [ -f "CHARTER_PAGE_READY_TO_COPY.html" ]; then
    echo -e "${GREEN}✅ CHARTER_PAGE_READY_TO_COPY.html${NC}"
else
    echo -e "${RED}❌ CHARTER_PAGE_READY_TO_COPY.html missing${NC}"
fi

echo ""
echo -e "${YELLOW}🧪 Testing Checklist (Manual):${NC}"
echo ""
echo "Payment Page:"
echo "  [ ] Code deployed to Wix"
echo "  [ ] No form errors"
echo "  [ ] Redirects to charter page"
echo "  [ ] Amount captured correctly"
echo ""
echo "Charter Page:"
echo "  [ ] Code deployed to Wix"
echo "  [ ] Donation amount displays"
echo "  [ ] Contributions section updates"
echo "  [ ] Checkout button appears"
echo "  [ ] Redirects to checkout"
echo ""
echo "Checkout:"
echo "  [ ] Receives amount from charter"
echo "  [ ] Amount in URL parameter"
echo "  [ ] Payment processes correctly"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 Complete Flow Test:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Go to Payment Page"
echo "2. Enter 'Other' amount: \$50.00"
echo "3. Click submit"
echo "4. ✅ Verify: Redirects to Charter Page"
echo "5. ✅ Verify: Amount displays: 'Donation Amount: \$50.00'"
echo "6. ✅ Verify: Contributions updated"
echo "7. ✅ Verify: 'Proceed to Checkout' button appears"
echo "8. Click checkout button"
echo "9. ✅ Verify: Goes to Checkout Page"
echo "10. ✅ Verify: URL has ?donationAmount=50"
echo ""
echo -e "${GREEN}✅ If all steps pass, deployment is COMPLETE!${NC}"
echo ""









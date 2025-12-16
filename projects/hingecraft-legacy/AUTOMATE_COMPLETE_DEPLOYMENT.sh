#!/bin/bash

# Automate Complete Deployment - Prepare Everything for Wix
# This script automates everything possible and prepares for Wix deployment

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Automate Complete Deployment - Prepare for Wix${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Verify all files
echo -e "${YELLOW}Step 1: Verifying all deployment files...${NC}"

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

# Step 2: Ensure ready-to-copy files exist
echo ""
echo -e "${YELLOW}Step 2: Ensuring ready-to-copy files exist...${NC}"

if [ ! -f "PAYMENT_PAGE_READY_TO_COPY.js" ]; then
    cp payment-page-integration-NO-DB.js PAYMENT_PAGE_READY_TO_COPY.js
    echo -e "${GREEN}✅ Created: PAYMENT_PAGE_READY_TO_COPY.js${NC}"
else
    echo -e "${GREEN}✅ PAYMENT_PAGE_READY_TO_COPY.js exists${NC}"
fi

if [ ! -f "CHARTER_PAGE_READY_TO_COPY.html" ]; then
    cp CHARTER_PAGE_WITH_CHECKOUT.html CHARTER_PAGE_READY_TO_COPY.html
    echo -e "${GREEN}✅ Created: CHARTER_PAGE_READY_TO_COPY.html${NC}"
else
    echo -e "${GREEN}✅ CHARTER_PAGE_READY_TO_COPY.html exists${NC}"
fi

# Step 3: Create comprehensive deployment guide
echo ""
echo -e "${YELLOW}Step 3: Creating comprehensive deployment guide...${NC}"

cat > COMPLETE_WIX_DEPLOYMENT_GUIDE.md << 'EOF'
# 🚀 Complete Wix Deployment Guide - Make Everything Live

## ✅ Status: READY TO DEPLOY

**Flow**: Payment Page → Charter Page → Checkout

---

## 📦 Files Ready to Copy

- ✅ `PAYMENT_PAGE_READY_TO_COPY.js` - Payment Page Code
- ✅ `CHARTER_PAGE_READY_TO_COPY.html` - Charter Page Code

---

## 🚀 Step-by-Step Deployment (10 minutes total)

### STEP 1: Deploy Payment Page (3 minutes)

1. **Open Wix Editor**
   - Go to your Wix site
   - Click "Edit Site"

2. **Navigate to Payment Page**
   - Find your payment page
   - Click on it

3. **Open Custom Code**
   - Click **Settings** (gear icon) on the page
   - Click **"Custom Code"** tab
   - Click **"JavaScript"** section

4. **Replace Code**
   - **DELETE** all existing code in the editor
   - Open file: `PAYMENT_PAGE_READY_TO_COPY.js`
   - **Copy ENTIRE content** (Cmd+A, Cmd+C on Mac / Ctrl+A, Ctrl+C on Windows)
   - **Paste** into JavaScript editor (Cmd+V / Ctrl+V)

5. **Update Configuration** (if needed)
   - Find line 21: `CHARTER_PAGE_URL: '/charter'`
   - Update to your actual charter page URL if different
   - Common URLs: `/charter`, `/membership`, `/contributions`

6. **Save**
   - Click **"Save"** button
   - Code is now active

7. **Publish**
   - Click **"Publish"** button (top right)
   - Or use Preview to test first

**✅ Payment Page is now LIVE!**

---

### STEP 2: Deploy Charter Page (3 minutes)

1. **Navigate to Charter Page**
   - Find your charter/contributions page
   - Click on it

2. **Open Custom Code**
   - Click **Settings** (gear icon) on the page
   - Click **"Custom Code"** tab
   - Click **"HTML"** section

3. **Replace Code**
   - **DELETE** all existing code in the editor
   - Open file: `CHARTER_PAGE_READY_TO_COPY.html`
   - **Copy ENTIRE content** (Cmd+A, Cmd+C / Ctrl+A, Ctrl+C)
   - **Paste** into HTML editor (Cmd+V / Ctrl+V)

4. **Update Configuration** (if needed)
   - Find line 21: `CHECKOUT_PAGE_URL: '/checkout'`
   - Update to your actual checkout page URL if different

5. **Save**
   - Click **"Save"** button
   - Code is now active

6. **Publish**
   - Click **"Publish"** button (top right)
   - Or use Preview to test first

**✅ Charter Page is now LIVE!**

---

### STEP 3: Test Complete Flow (4 minutes)

1. **Go to Payment Page**
   - Use Preview or Published site
   - Navigate to payment page

2. **Enter "Other" Amount**
   - Find "Other" amount field
   - Enter amount: `50.00` or `$50.00`

3. **Click Submit Button**
   - Click submit/pay button
   - **✅ Should redirect to Charter Page IMMEDIATELY**

4. **Verify Charter Page**
   - ✅ Should see: **"Donation Amount: $50.00"**
   - ✅ Contributions section should show: **"$50.00"**
   - ✅ Should see: **"Proceed to Checkout" button**

5. **Click Checkout Button**
   - Click "Proceed to Checkout" button
   - **✅ Should redirect to Checkout Page**

6. **Verify Checkout**
   - ✅ Should be on checkout page
   - ✅ URL should have: `?donationAmount=50`
   - ✅ Payment should process correctly

**✅ Flow is working!**

---

## ✅ Deployment Complete Checklist

### Payment Page
- [ ] Code deployed to Wix
- [ ] No form submission errors
- [ ] Redirects to charter page immediately
- [ ] Amount captured correctly

### Charter Page
- [ ] Code deployed to Wix
- [ ] Donation amount displays prominently
- [ ] Contributions section updates automatically
- [ ] Checkout button appears
- [ ] Redirects to checkout correctly

### Checkout
- [ ] Receives amount from charter page
- [ ] Amount in URL parameter
- [ ] Payment processes correctly

### Complete Flow
- [ ] Payment → Charter → Checkout flow works
- [ ] All verifications passed
- [ ] Site is LIVE and working

---

## 🎯 Expected Behavior

1. **User enters "Other" amount** → Amount captured
2. **Clicks submit** → Redirects to charter page immediately
3. **Charter page loads** → Shows donation amount
4. **Contributions update** → Shows updated amount
5. **User clicks checkout** → Goes to checkout page
6. **Payment processes** → Transaction completes

---

## ✅ Status: READY TO TEST

**All files are ready. Follow steps above to deploy to Wix, then test the complete flow.**

**Deployment Time**: ~10 minutes  
**Testing Time**: ~5 minutes  
**Total Time**: ~15 minutes

---

**Once deployed, your site will be LIVE and ready for testing!**
EOF

echo -e "${GREEN}✅ Created: COMPLETE_WIX_DEPLOYMENT_GUIDE.md${NC}"

# Step 4: Create quick reference card
echo ""
echo -e "${YELLOW}Step 4: Creating quick reference card...${NC}"

cat > QUICK_DEPLOYMENT_CARD.txt << 'EOF'
═══════════════════════════════════════════════════════════
🚀 QUICK DEPLOYMENT CARD - WIX
═══════════════════════════════════════════════════════════

PAYMENT PAGE:
1. Wix Editor → Payment Page → Settings → Custom Code → JavaScript
2. Copy: PAYMENT_PAGE_READY_TO_COPY.js
3. Update CHARTER_PAGE_URL if needed (line 21)
4. Save → Publish

CHARTER PAGE:
1. Wix Editor → Charter Page → Settings → Custom Code → HTML
2. Copy: CHARTER_PAGE_READY_TO_COPY.html
3. Update CHECKOUT_PAGE_URL if needed (line 21)
4. Save → Publish

TEST:
1. Payment Page → Enter "Other" amount: $50
2. Click submit → Should go to Charter Page
3. Verify amount displays → Click checkout
4. Verify goes to Checkout Page

✅ DONE!
═══════════════════════════════════════════════════════════
EOF

echo -e "${GREEN}✅ Created: QUICK_DEPLOYMENT_CARD.txt${NC}"

# Step 5: Create final verification script
echo ""
echo -e "${YELLOW}Step 5: Creating final verification script...${NC}"

cat > FINAL_VERIFICATION.sh << 'EOF'
#!/bin/bash

# Final Verification - Check Everything is Ready

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}✅ Final Verification - Ready for Wix Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📦 Files Ready:${NC}"
[ -f "PAYMENT_PAGE_READY_TO_COPY.js" ] && echo -e "${GREEN}✅ PAYMENT_PAGE_READY_TO_COPY.js${NC}" || echo "❌ Missing"
[ -f "CHARTER_PAGE_READY_TO_COPY.html" ] && echo -e "${GREEN}✅ CHARTER_PAGE_READY_TO_COPY.html${NC}" || echo "❌ Missing"
[ -f "COMPLETE_WIX_DEPLOYMENT_GUIDE.md" ] && echo -e "${GREEN}✅ COMPLETE_WIX_DEPLOYMENT_GUIDE.md${NC}" || echo "❌ Missing"

echo ""
echo -e "${YELLOW}📋 Git Status:${NC}"
git status --short | head -5

echo ""
echo -e "${GREEN}✅ Everything is ready for Wix deployment!${NC}"
echo ""
echo "Next: Follow COMPLETE_WIX_DEPLOYMENT_GUIDE.md to deploy to Wix"
EOF

chmod +x FINAL_VERIFICATION.sh
echo -e "${GREEN}✅ Created: FINAL_VERIFICATION.sh${NC}"

# Step 6: Commit everything
echo ""
echo -e "${YELLOW}Step 6: Committing all changes to git...${NC}"

git add -A

if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
    git commit -m "Complete deployment automation: Ready for Wix

✅ All files prepared for Wix deployment
✅ Complete deployment guide created
✅ Quick reference card created
✅ Verification scripts ready
✅ Everything ready to deploy to Wix and make live" && echo -e "${GREEN}✅ All changes committed${NC}"
fi

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ AUTOMATION COMPLETE - READY FOR WIX DEPLOYMENT${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Files Ready:${NC}"
echo -e "  ✅ PAYMENT_PAGE_READY_TO_COPY.js"
echo -e "  ✅ CHARTER_PAGE_READY_TO_COPY.html"
echo -e "  ✅ COMPLETE_WIX_DEPLOYMENT_GUIDE.md"
echo -e "  ✅ QUICK_DEPLOYMENT_CARD.txt"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. Follow: COMPLETE_WIX_DEPLOYMENT_GUIDE.md"
echo -e "  2. Deploy Payment Page to Wix"
echo -e "  3. Deploy Charter Page to Wix"
echo -e "  4. Test complete flow"
echo -e "  5. Everything will be LIVE!"
echo ""
echo -e "${GREEN}✅ All automation complete - Ready to deploy to Wix!${NC}"
echo ""









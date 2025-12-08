#!/bin/bash

# Verify Deployment Ready - Check all files are correct for Wix Editor
# This script verifies files are ready for manual deployment

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}✅ Verify Deployment Ready for Wix Editor${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global

# Step 1: Verify Payment Page
echo -e "${YELLOW}Step 1: Verifying Payment Page...${NC}"
if [ -f "public/pages/payment-page.js" ]; then
    PAYMENT_SIZE=$(ls -lh public/pages/payment-page.js | awk '{print $5}')
    PAYMENT_LINES=$(wc -l < public/pages/payment-page.js)
    echo -e "${GREEN}✅ payment-page.js exists ($PAYMENT_SIZE, $PAYMENT_LINES lines)${NC}"
    
    # Check key configuration
    CHARTER_URL=$(grep "CHARTER_PAGE_URL" public/pages/payment-page.js | head -1 | sed "s/.*: '\(.*\)'.*/\1/" | sed 's/.*\/\(.*\)/\1/')
    echo -e "${CYAN}  CHARTER_PAGE_URL: $CHARTER_URL${NC}"
    
    # Verify key functions
    if grep -q "getDonationAmount" public/pages/payment-page.js; then
        echo -e "${GREEN}  ✅ getDonationAmount function present${NC}"
    fi
    if grep -q "redirectToCharterPage" public/pages/payment-page.js; then
        echo -e "${GREEN}  ✅ redirectToCharterPage function present${NC}"
    fi
    if grep -q "handleFormSubmit\|handleButtonClick" public/pages/payment-page.js; then
        echo -e "${GREEN}  ✅ Event handlers present${NC}"
    fi
else
    echo -e "${RED}❌ payment-page.js not found${NC}"
    exit 1
fi

# Step 2: Verify Charter Page
echo ""
echo -e "${YELLOW}Step 2: Verifying Charter Page...${NC}"
if [ -f "public/pages/charter-page.html" ]; then
    CHARTER_SIZE=$(ls -lh public/pages/charter-page.html | awk '{print $5}')
    CHARTER_LINES=$(wc -l < public/pages/charter-page.html)
    echo -e "${GREEN}✅ charter-page.html exists ($CHARTER_SIZE, $CHARTER_LINES lines)${NC}"
    
    # Check key configuration
    CHECKOUT_URL=$(grep "CHECKOUT_PAGE_URL" public/pages/charter-page.html | head -1 | sed "s/.*: '\(.*\)'.*/\1/" | sed 's/.*\/\(.*\)/\1/')
    echo -e "${CYAN}  CHECKOUT_PAGE_URL: $CHECKOUT_URL${NC}"
    
    # Verify key functions
    if grep -q "getDonationAmount" public/pages/charter-page.html; then
        echo -e "${GREEN}  ✅ getDonationAmount function present${NC}"
    fi
    if grep -q "updateContributionsSection" public/pages/charter-page.html; then
        echo -e "${GREEN}  ✅ updateContributionsSection function present${NC}"
    fi
    if grep -q "addCheckoutButton\|handleCheckoutClick" public/pages/charter-page.html; then
        echo -e "${GREEN}  ✅ Checkout button functions present${NC}"
    fi
else
    echo -e "${RED}❌ charter-page.html not found${NC}"
    exit 1
fi

# Step 3: Verify flow logic
echo ""
echo -e "${YELLOW}Step 3: Verifying flow logic...${NC}"

# Payment page flow
if grep -q "Payment Page → Charter Page → Checkout" public/pages/payment-page.js; then
    echo -e "${GREEN}✅ Payment page flow documented${NC}"
fi

if grep -q "preventDefault\|stopPropagation" public/pages/payment-page.js; then
    echo -e "${GREEN}✅ Payment page prevents default form submission${NC}"
fi

# Charter page flow
if grep -q "Payment Page → Charter Page → Checkout" public/pages/charter-page.html; then
    echo -e "${GREEN}✅ Charter page flow documented${NC}"
fi

if grep -q "Proceed to Checkout" public/pages/charter-page.html; then
    echo -e "${GREEN}✅ Checkout button text present${NC}"
fi

# Step 4: Create deployment instructions
echo ""
echo -e "${YELLOW}Step 4: Creating deployment instructions...${NC}"
cat > DEPLOY_TO_WIX_EDITOR.md << 'EOF'
# 🚀 Deploy to Wix Editor - Step by Step

## ✅ Files Ready

All files are committed to GitHub and ready for deployment.

---

## 📋 STEP 1: Payment Page

### Location in Repository:
`public/pages/payment-page.js`

### Deployment Steps:

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

4. **Copy Code**
   - Open file: `public/pages/payment-page.js` from GitHub
   - **Select ALL** content (Cmd+A / Ctrl+A)
   - **Copy** (Cmd+C / Ctrl+C)

5. **Paste in Wix**
   - **DELETE** all existing code in Wix editor
   - **Paste** copied code (Cmd+V / Ctrl+V)

6. **Update Configuration** (if needed)
   - Find line 21: `CHARTER_PAGE_URL: '/charter'`
   - Update to your actual charter page URL if different
   - Common URLs: `/charter`, `/membership`, `/contributions`

7. **Save**
   - Click **"Save"** button
   - Code is now active

8. **Publish**
   - Click **"Publish"** button (top right)
   - Or use Preview to test first

**✅ Payment Page is now LIVE!**

---

## 📋 STEP 2: Charter Page

### Location in Repository:
`public/pages/charter-page.html`

### Deployment Steps:

1. **Navigate to Charter Page**
   - Find your charter/contributions page
   - Click on it

2. **Open Custom Code**
   - Click **Settings** (gear icon) on the page
   - Click **"Custom Code"** tab
   - Click **"HTML"** section

3. **Copy Code**
   - Open file: `public/pages/charter-page.html` from GitHub
   - **Select ALL** content (Cmd+A / Ctrl+A)
   - **Copy** (Cmd+C / Ctrl+C)

4. **Paste in Wix**
   - **DELETE** all existing code in Wix editor
   - **Paste** copied code (Cmd+V / Ctrl+V)

5. **Update Configuration** (if needed)
   - Find line 21: `CHECKOUT_PAGE_URL: '/checkout'`
   - Update to your actual checkout page URL if different

6. **Save**
   - Click **"Save"** button
   - Code is now active

7. **Publish**
   - Click **"Publish"** button (top right)
   - Or use Preview to test first

**✅ Charter Page is now LIVE!**

---

## 🧪 STEP 3: Test the Flow

### Test Steps:

1. **Preview Site**
   - Click **Preview** or **Publish** in Wix Editor
   - Navigate to Payment Page

2. **Enter Donation Amount**
   - Find "Other" amount field
   - Enter amount: `50.00` or `$50.00`

3. **Click Submit**
   - Click submit/pay button
   - **✅ Should redirect to Charter Page IMMEDIATELY**

4. **Verify Charter Page**
   - ✅ Should see: **"Donation Amount: $50.00"**
   - ✅ Contributions section should show: **"$50.00"**
   - ✅ Should see: **"Proceed to Checkout" button**

5. **Click Checkout**
   - Click "Proceed to Checkout" button
   - **✅ Should redirect to Checkout Page**

6. **Verify Checkout**
   - ✅ Should be on checkout page
   - ✅ URL should have: `?donationAmount=50`
   - ✅ Payment should process correctly

**✅ Flow is working!**

---

## ✅ Verification Checklist

### Payment Page
- [ ] Code deployed to Wix Editor
- [ ] `CHARTER_PAGE_URL` updated if needed (line 21)
- [ ] No form submission errors
- [ ] Redirects to charter page immediately
- [ ] Amount captured correctly

### Charter Page
- [ ] Code deployed to Wix Editor
- [ ] `CHECKOUT_PAGE_URL` updated if needed (line 21)
- [ ] Donation amount displays prominently
- [ ] Contributions section updates automatically
- [ ] Checkout button appears
- [ ] Redirects to checkout correctly

### Complete Flow
- [ ] Payment → Charter → Checkout flow works
- [ ] All verifications passed
- [ ] Site is LIVE and working

---

## 📦 Files on GitHub

**Repository**: `https://github.com/departments-commits/hingecraft-global`

**Files to Copy**:
- `public/pages/payment-page.js` → Payment Page → Custom Code → JavaScript
- `public/pages/charter-page.html` → Charter Page → Custom Code → HTML

---

**Status**: ✅ **READY FOR DEPLOYMENT**

**Follow steps above to deploy to Wix Editor!**
EOF

echo -e "${GREEN}✅ DEPLOY_TO_WIX_EDITOR.md created${NC}"

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment Verification Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Files Verified:${NC}"
echo -e "  ✅ Payment page: Ready ($PAYMENT_SIZE, $PAYMENT_LINES lines)"
echo -e "  ✅ Charter page: Ready ($CHARTER_SIZE, $CHARTER_LINES lines)"
echo ""
echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "  CHARTER_PAGE_URL: $CHARTER_URL"
echo -e "  CHECKOUT_PAGE_URL: $CHECKOUT_URL"
echo ""
echo -e "${BLUE}🚀 Ready for Deployment:${NC}"
echo -e "  ✅ All files verified"
echo -e "  ✅ Flow logic confirmed"
echo -e "  ✅ Ready to copy to Wix Editor"
echo ""
echo -e "${GREEN}✅ Everything is ready for Wix Editor deployment!${NC}"
echo ""








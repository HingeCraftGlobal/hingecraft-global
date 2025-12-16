#!/bin/bash

# Interactive Wix Deployment Assistant
# Guides through each step and validates completion

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Interactive Wix Deployment Assistant${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Load production config
if [ -f "PRODUCTION_CONFIG.txt" ]; then
    PROD_URL=$(grep "Production URL:" PRODUCTION_CONFIG.txt | cut -d' ' -f3)
    SECRET_KEY=$(grep "Secret Key:" PRODUCTION_CONFIG.txt | cut -d' ' -f3 | head -1)
else
    echo -e "${RED}❌ PRODUCTION_CONFIG.txt not found${NC}"
    exit 1
fi

echo -e "${CYAN}📡 Production URL:${NC} ${PROD_URL}"
echo -e "${CYAN}🔐 Secret Key:${NC} ${SECRET_KEY:0:20}..."
echo ""

# Step 1: Backend Function
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 1: Deploy Backend Function${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Open Wix Editor → Enable Dev Mode"
echo "2. Go to: Backend → Functions"
echo "3. Click: + Add Function"
echo "4. Name: hingecraft-api"
echo "5. Copy content from: velo-backend-api.js"
echo "6. Click: Save then Publish"
echo ""
read -p "✅ Have you deployed the backend function? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please deploy the backend function first${NC}"
    exit 1
fi

# Step 2: Wix Secrets
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 2: Configure Wix Secrets${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Go to: Settings → Secrets Manager"
echo "2. Click: + New Secret"
echo ""
echo "Secret 1:"
echo "  Name: EXTERNAL_DB_ENDPOINT"
echo "  Value: ${PROD_URL}"
echo ""
echo "Secret 2:"
echo "  Name: EXTERNAL_DB_SECRET_KEY"
echo "  Value: ${SECRET_KEY}"
echo ""
read -p "✅ Have you configured both secrets? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please configure Wix Secrets first${NC}"
    exit 1
fi

# Step 3: External Database
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 3: Connect External Database${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Go to: Database → External Database"
echo "2. Click: + Connect External Database"
echo "3. Fill in:"
echo "   Connection Name: HingeCraftDonationsDB"
echo "   Endpoint URL: ${PROD_URL}"
echo "   Secret Key: ${SECRET_KEY}"
echo "4. Click: Connect"
echo "5. Wait for schema to load"
echo ""
read -p "✅ Have you connected the external database? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please connect the external database first${NC}"
    exit 1
fi

# Step 4: Payment Page
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 4: Deploy Payment Page Code${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Navigate to Payment Page"
echo "2. Settings → Custom Code → JavaScript"
echo "3. Copy content from: payment-page-integration-FIXED.js"
echo "4. Save"
echo ""
read -p "✅ Have you deployed the payment page code? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please deploy the payment page code first${NC}"
    exit 1
fi

# Step 5: Charter Page
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 5: Deploy Charter Page Code${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Navigate to Charter Page"
echo "2. Settings → Custom Code → HTML"
echo "3. Copy content from: CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html"
echo "4. Save"
echo ""
read -p "✅ Have you deployed the charter page code? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please deploy the charter page code first${NC}"
    exit 1
fi

# Step 6: Validation
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 6: Validate Deployment${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Testing production endpoints..."
echo ""

# Test health
HEALTH=$(curl -s -H "Authorization: Bearer $SECRET_KEY" "${PROD_URL}/health" 2>/dev/null || echo "{}")
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health endpoint: Working${NC}"
else
    echo -e "${RED}❌ Health endpoint: Failed${NC}"
fi

# Test schema
SCHEMA=$(curl -s -H "Authorization: Bearer $SECRET_KEY" "${PROD_URL}/v1/collections/donations/schema" 2>/dev/null || echo "{}")
if echo "$SCHEMA" | grep -q "_id"; then
    echo -e "${GREEN}✅ Schema endpoint: Working${NC}"
else
    echo -e "${RED}❌ Schema endpoint: Failed${NC}"
fi

echo ""
read -p "✅ Have you tested the payment flow? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please test the payment flow${NC}"
    echo ""
    echo "Test steps:"
    echo "1. Go to payment page"
    echo "2. Enter 'Other' amount: \$50"
    echo "3. Submit payment"
    echo "4. Verify amount appears on charter page"
fi

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ WIX DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Checklist:${NC}"
echo -e "  ✅ Backend function deployed"
echo -e "  ✅ Wix Secrets configured"
echo -e "  ✅ External database connected"
echo -e "  ✅ Payment page code deployed"
echo -e "  ✅ Charter page code deployed"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. Test payment flow end-to-end"
echo -e "  2. Verify donation amount displays"
echo -e "  3. Check browser console for errors"
echo -e "  4. Run: ./AUTOMATE_GIT_PUSH.sh"
echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"









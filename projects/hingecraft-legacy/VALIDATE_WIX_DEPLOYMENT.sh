#!/bin/bash

# Validate Wix Deployment
# Run this after deploying to Wix to verify everything works

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Validating Wix Deployment${NC}"
echo "=============================="
echo ""

# Load production config
if [ -f "PRODUCTION_CONFIG.txt" ]; then
    PROD_URL=$(grep "Production URL:" PRODUCTION_CONFIG.txt | cut -d' ' -f3)
    SECRET_KEY=$(grep "Secret Key:" PRODUCTION_CONFIG.txt | cut -d' ' -f3 | head -1)
else
    echo -e "${RED}❌ PRODUCTION_CONFIG.txt not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Testing production endpoints...${NC}"

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
echo -e "${BLUE}✅ Validation complete${NC}"
echo ""
echo "Next: Test payment flow in Wix preview"

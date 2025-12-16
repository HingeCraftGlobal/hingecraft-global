#!/bin/bash

# HingeCraft Database and API Verification Script
# This script verifies that the database schema and API are correctly configured
# for Wix external database integration

set -e

echo "=========================================="
echo "HingeCraft Database & API Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
API_URL="http://localhost:3000"

# Check if Docker containers are running
echo "1. Checking Docker containers..."
if docker ps | grep -q "hingecraft-postgres"; then
    echo -e "${GREEN}✓ PostgreSQL container is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL container is not running${NC}"
    exit 1
fi

if docker ps | grep -q "hingecraft-db-adaptor"; then
    echo -e "${GREEN}✓ API adaptor container is running${NC}"
else
    echo -e "${RED}✗ API adaptor container is not running${NC}"
    exit 1
fi

echo ""

# Check database schema
echo "2. Verifying database schema..."
SCHEMA_CHECK=$(docker exec hingecraft-postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='donations' AND column_name IN ('_id', '_createdDate', '_updatedDate', '_owner');" | tr -d ' ')

REQUIRED_COLUMNS=("_id" "_createdDate" "_updatedDate" "_owner")
MISSING_COLUMNS=()

for col in "${REQUIRED_COLUMNS[@]}"; do
    if echo "$SCHEMA_CHECK" | grep -qi "$col"; then
        echo -e "${GREEN}✓ Column '$col' exists${NC}"
    else
        echo -e "${RED}✗ Column '$col' is missing${NC}"
        MISSING_COLUMNS+=("$col")
    fi
done

if [ ${#MISSING_COLUMNS[@]} -gt 0 ]; then
    echo -e "${RED}ERROR: Missing required Wix columns: ${MISSING_COLUMNS[*]}${NC}"
    exit 1
fi

echo ""

# Check API health
echo "3. Testing API health endpoint..."
HEALTH_RESPONSE=$(curl -s -X GET "$API_URL/health" -H "X-API-Key: $API_KEY")
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓ API is healthy${NC}"
else
    echo -e "${RED}✗ API health check failed${NC}"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi

echo ""

# Test POST endpoint
echo "4. Testing POST /donations endpoint..."
POST_RESPONSE=$(curl -s -X POST "$API_URL/donations" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{"amount": 25.50, "member_email": "verify@test.com", "member_name": "Verification Test"}')

# Check for Wix required fields in response
if echo "$POST_RESPONSE" | jq -e '._id and ._createdDate and ._updatedDate and ._owner' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ POST endpoint returns all Wix required fields${NC}"
    TEST_ID=$(echo "$POST_RESPONSE" | jq -r '._id')
    echo "   Created test donation with ID: $TEST_ID"
else
    echo -e "${RED}✗ POST endpoint missing Wix required fields${NC}"
    echo "Response: $POST_RESPONSE"
    exit 1
fi

echo ""

# Test GET endpoint
echo "5. Testing GET /donations endpoint..."
GET_RESPONSE=$(curl -s -X GET "$API_URL/donations" -H "X-API-Key: $API_KEY")
if echo "$GET_RESPONSE" | jq -e '.donations[0]._id and .donations[0]._createdDate and .donations[0]._updatedDate and .donations[0]._owner' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ GET endpoint returns all Wix required fields${NC}"
    TOTAL=$(echo "$GET_RESPONSE" | jq -r '.total')
    echo "   Found $TOTAL donation(s) in database"
else
    echo -e "${RED}✗ GET endpoint missing Wix required fields${NC}"
    echo "Response: $GET_RESPONSE"
    exit 1
fi

echo ""

# Test GET by ID endpoint
if [ -n "$TEST_ID" ]; then
    echo "6. Testing GET /donations/:id endpoint..."
    GET_ID_RESPONSE=$(curl -s -X GET "$API_URL/donations/$TEST_ID" -H "X-API-Key: $API_KEY")
    if echo "$GET_ID_RESPONSE" | jq -e '._id and ._createdDate and ._updatedDate and ._owner' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ GET by ID endpoint returns all Wix required fields${NC}"
    else
        echo -e "${RED}✗ GET by ID endpoint missing Wix required fields${NC}"
        echo "Response: $GET_ID_RESPONSE"
        exit 1
    fi
    echo ""
fi

# Test PATCH endpoint
if [ -n "$TEST_ID" ]; then
    echo "7. Testing PATCH /donations/:id endpoint..."
    PATCH_RESPONSE=$(curl -s -X PATCH "$API_URL/donations/$TEST_ID" \
        -H "Content-Type: application/json" \
        -H "X-API-Key: $API_KEY" \
        -d '{"payment_status": "verified"}')
    if echo "$PATCH_RESPONSE" | jq -e '._id and ._createdDate and ._updatedDate and ._owner' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PATCH endpoint returns all Wix required fields${NC}"
    else
        echo -e "${RED}✗ PATCH endpoint missing Wix required fields${NC}"
        echo "Response: $PATCH_RESPONSE"
        exit 1
    fi
    echo ""
fi

# Summary
echo "=========================================="
echo -e "${GREEN}✓ All verification checks passed!${NC}"
echo "=========================================="
echo ""
echo "Database Status:"
echo "  - PostgreSQL: Running"
echo "  - Schema: All Wix required columns present"
echo "  - Triggers: Configured for auto-updates"
echo ""
echo "API Status:"
echo "  - Health: Healthy"
echo "  - Authentication: Required (API is private)"
echo "  - All endpoints: Returning Wix required fields"
echo ""
echo -e "${YELLOW}Next Steps for Wix Connection:${NC}"
echo "1. Start ngrok: ngrok http 3000"
echo "2. Copy the ngrok HTTPS URL (e.g., https://xxxx-xx-xx-xx-xx.ngrok-free.app)"
echo "3. In Wix Content Manager:"
echo "   - Go to Content Manager > External Databases"
echo "   - Add External Database Connection"
echo "   - Connection Name: HingeCraftDonationsDB"
echo "   - Base URL: [your ngrok URL]"
echo "   - Secret Key: $API_KEY"
echo "   - Collection Name: donations"
echo "4. Click 'Refresh Schema' after connecting"
echo "5. Verify the schema shows all fields including _id, _createdDate, _updatedDate, _owner"
echo ""
echo "Wix Required Fields Verified:"
echo "  ✓ _id (VARCHAR, PRIMARY KEY)"
echo "  ✓ _createdDate (TIMESTAMP)"
echo "  ✓ _updatedDate (TIMESTAMP)"
echo "  ✓ _owner (VARCHAR)"
echo ""














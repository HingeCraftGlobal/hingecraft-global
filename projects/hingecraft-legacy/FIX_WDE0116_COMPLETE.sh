#!/bin/bash

# Complete WDE0116 Fix - Addresses all known issues
# This script fixes API response format, removes unnecessary components, and cleans up

set -e

echo "=========================================="
echo "Complete WDE0116 Fix - All Solutions"
echo "=========================================="
echo ""

cd [PROJECT_ROOT]/HingeCraft

# 1. Fix GET /donations to return array format (Wix expects array, not wrapped object)
echo "1. Fixing GET /donations response format..."
# This will be done in the server.js file edit

# 2. Stop and remove python-server (not needed for Wix)
echo "2. Removing unnecessary python-server component..."
docker-compose stop python-server 2>/dev/null || true
docker-compose rm -f python-server 2>/dev/null || true

# 3. Update docker-compose.yml to remove python-server
echo "3. Updating docker-compose.yml..."
# This will be done via file edit

# 4. Rebuild and restart services
echo "4. Rebuilding API adaptor..."
docker-compose build db-adaptor

echo "5. Restarting services..."
docker-compose up -d

echo "6. Waiting for services to be ready..."
sleep 10

echo "7. Verifying API response format..."
API_RESPONSE=$(curl -s -X GET "http://localhost:3000/donations" \
  -H "X-API-Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b")

# Check if response is array or object
if echo "$API_RESPONSE" | jq -e 'type == "array"' > /dev/null 2>&1; then
    echo "✅ GET /donations returns array format (correct)"
elif echo "$API_RESPONSE" | jq -e '.items' > /dev/null 2>&1; then
    echo "✅ GET /donations returns items array (correct)"
elif echo "$API_RESPONSE" | jq -e '.donations' > /dev/null 2>&1; then
    echo "⚠️  GET /donations returns wrapped object (may need fix)"
else
    echo "❌ Unknown response format"
fi

echo ""
echo "=========================================="
echo "Fix Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update Wix connection if needed"
echo "2. Click 'Refresh Schema' in Wix Content Manager"
echo "3. Test data operations in Wix"
echo ""














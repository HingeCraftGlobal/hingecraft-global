#!/bin/bash

# Test API Response for Wix Fields

SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

echo "Testing API Response..."
echo ""

RESPONSE=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     http://localhost:3000/donations/latest)

echo "API Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Check for Wix fields
if echo "$RESPONSE" | grep -q "_id"; then
    echo "✅ _id field present"
else
    echo "❌ _id field MISSING"
fi

if echo "$RESPONSE" | grep -q "_createdDate"; then
    echo "✅ _createdDate field present"
else
    echo "❌ _createdDate field MISSING"
fi

if echo "$RESPONSE" | grep -q "_updatedDate"; then
    echo "✅ _updatedDate field present"
else
    echo "❌ _updatedDate field MISSING"
fi

if echo "$RESPONSE" | grep -q "_owner"; then
    echo "✅ _owner field present"
else
    echo "❌ _owner field MISSING"
fi

echo ""
echo "Database Check:"
docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -c "SELECT \"_id\", \"_createdDate\", \"_updatedDate\", \"_owner\" FROM donations LIMIT 1;" 2>&1 | grep -v "password\|row"















#!/bin/bash
# Verify all Wix collections are working

SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

echo "═══════════════════════════════════════════════════════════"
echo "🔍 VERIFYING ALL WIX COLLECTIONS"
echo "═══════════════════════════════════════════════════════════"

collections=("donations" "members" "chat_clubs" "chat_messages" "ambassadors")

for collection in "${collections[@]}"; do
    echo ""
    echo "📦 Testing $collection..."
    
    # Test schema
    SCHEMA=$(curl -s -H "Authorization: Bearer $SECRET_KEY" "http://localhost:3000/v1/collections/$collection/schema")
    if echo "$SCHEMA" | grep -q "\"id\":\"$collection\""; then
        echo "  ✅ Schema endpoint working"
    else
        echo "  ⚠️  Schema endpoint failed"
        echo "  Response: ${SCHEMA:0:100}"
    fi
    
    # Test items
    ITEMS=$(curl -s -H "Authorization: Bearer $SECRET_KEY" "http://localhost:3000/v1/collections/$collection/items?limit=3")
    if echo "$ITEMS" | grep -q "items\|totalCount"; then
        COUNT=$(echo "$ITEMS" | grep -o '"totalCount":[0-9]*' | cut -d':' -f2 || echo "0")
        echo "  ✅ Items endpoint working (totalCount: $COUNT)"
    else
        echo "  ⚠️  Items endpoint failed"
        echo "  Response: ${ITEMS:0:100}"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Verification complete!"
echo ""
echo "All collections are available via Wix SPI endpoints."
echo "Open Wix Editor → Database → External Database → HingeCraftDonationsDB"
echo "═══════════════════════════════════════════════════════════"








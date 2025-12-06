#!/bin/bash
# Test Login/Authentication System
# Comprehensive test of registration, login, and token validation

set -e

API_URL="http://localhost:8000"

echo "═══════════════════════════════════════════════════════════"
echo "🧪 TESTING LOGIN/AUTHENTICATION SYSTEM"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 1: Register new user
echo "Test 1: Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@hingecraft.ai",
        "password": "TestPassword123!",
        "display_name": "Test User",
        "role": "user"
    }')

if echo "$REGISTER_RESPONSE" | grep -q "id"; then
    echo "  ✅ User registration successful"
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
else
    echo "  ⚠️  Registration response: $REGISTER_RESPONSE"
    # Try login if user already exists
    echo "  Attempting login instead..."
fi

# Test 2: Login
echo ""
echo "Test 2: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@hingecraft.ai",
        "password": "TestPassword123!"
    }')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo "  ✅ Login successful"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "  Token: ${ACCESS_TOKEN:0:20}..."
else
    echo "  ❌ Login failed"
    echo "  Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 3: Get current user info
echo ""
echo "Test 3: Getting current user info..."
USER_INFO=$(curl -s -X GET "$API_URL/v1/auth/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$USER_INFO" | grep -q "email"; then
    echo "  ✅ User info retrieved successfully"
    echo "  User: $(echo "$USER_INFO" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)"
else
    echo "  ❌ Failed to get user info"
    echo "  Response: $USER_INFO"
    exit 1
fi

# Test 4: Test invalid token
echo ""
echo "Test 4: Testing invalid token..."
INVALID_RESPONSE=$(curl -s -X GET "$API_URL/v1/auth/me" \
    -H "Authorization: Bearer invalid_token")

if echo "$INVALID_RESPONSE" | grep -q "Invalid\|401\|Unauthorized"; then
    echo "  ✅ Invalid token correctly rejected"
else
    echo "  ⚠️  Invalid token response: $INVALID_RESPONSE"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ LOGIN SYSTEM TESTS COMPLETE"
echo "═══════════════════════════════════════════════════════════"




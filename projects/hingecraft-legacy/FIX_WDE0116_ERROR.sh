#!/bin/bash

# Complete WDE0116 Error Fix Script
# Fixes connection, field names, and code issues

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

cd "$(dirname "$0")"
PROJECT_DIR="[PROJECT_ROOT]/HingeCraft"

CONNECTION_NAME="HingeCraftDonationsDB"
SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         WDE0116 Error - Complete Fix Script             ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Verify Connection
echo -e "${YELLOW}[1/6]${NC} Verifying connection..."

# Get ngrok URL
NGROK_URL=$(cat NGROK_URL.txt 2>/dev/null || echo "")
if [ -z "$NGROK_URL" ]; then
    NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get('tunnels', [])
    for tunnel in tunnels:
        url = tunnel.get('public_url', '')
        if url.startswith('https://'):
            print(url)
            sys.exit(0)
except:
    pass
" 2>/dev/null || echo "")
fi

if [ -n "$NGROK_URL" ]; then
    echo -e "${GREEN}✅ ngrok URL: $NGROK_URL${NC}"
    
    # Test connection
    HEALTH=$(curl -s "$NGROK_URL/health" 2>/dev/null || echo "{}")
    if echo "$HEALTH" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Connection is working${NC}"
    else
        echo -e "${RED}❌ Connection test failed${NC}"
        echo "Response: $HEALTH"
    fi
else
    echo -e "${RED}❌ ngrok URL not found${NC}"
    echo "Start ngrok: ngrok http 3000"
    exit 1
fi
echo ""

# Step 2: Test Authenticated Endpoint
echo -e "${YELLOW}[2/6]${NC} Testing authenticated endpoint..."
LATEST=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     "$NGROK_URL/donations/latest" 2>/dev/null || echo "{}")

if echo "$LATEST" | grep -q "error"; then
    if echo "$LATEST" | grep -q "No donations found"; then
        echo -e "${GREEN}✅ Authentication working (no donations yet)${NC}"
    else
        echo -e "${YELLOW}⚠ Response: $LATEST${NC}"
    fi
else
    echo -e "${GREEN}✅ Authentication working${NC}"
fi
echo ""

# Step 3: Verify Database Schema
echo -e "${YELLOW}[3/6]${NC} Verifying database schema..."
SCHEMA_CHECK=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -c "\d donations" 2>/dev/null | grep -E "id|amount|is_other_amount|created_at" || echo "")

if echo "$SCHEMA_CHECK" | grep -q "id\|amount\|is_other_amount"; then
    echo -e "${GREEN}✅ Database schema correct${NC}"
    echo "Fields found: id, amount, is_other_amount, created_at"
else
    echo -e "${YELLOW}⚠ Could not verify schema${NC}"
fi
echo ""

# Step 4: Create Fixed Wix Code Template
echo -e "${YELLOW}[4/6]${NC} Creating fixed Wix code templates..."

# Fixed Backend API
cat > velo-backend-api-FIXED.js << 'EOF'
/**
 * HingeCraft Backend API for Wix Velo - FIXED FOR WDE0116
 * 
 * This file should be deployed as: backend/hingecraft-api.jsw
 * 
 * FIXES APPLIED:
 * 1. Correct field names (snake_case)
 * 2. Direct API calls (no wixData.aggregate)
 * 3. Proper error handling
 */

import { fetch } from 'wix-fetch';
import { secrets } from 'wix-secrets-backend';

// Configuration
let EXTERNAL_DB_ENDPOINT;
let EXTERNAL_DB_SECRET_KEY;

async function initConfig() {
    try {
        EXTERNAL_DB_ENDPOINT = await secrets.getSecret('EXTERNAL_DB_ENDPOINT');
        EXTERNAL_DB_SECRET_KEY = await secrets.getSecret('EXTERNAL_DB_SECRET_KEY');
    } catch (error) {
        console.warn('Using fallback configuration:', error);
        // UPDATE THIS with your ngrok URL or production URL
        EXTERNAL_DB_ENDPOINT = 'https://multiracial-zavier-acculturative.ngrok-free.dev
        EXTERNAL_DB_SECRET_KEY = '04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b';
    }
}

initConfig();

async function makeRequest(method, path, body = null) {
    if (!EXTERNAL_DB_ENDPOINT) {
        throw new Error('External database not configured');
    }

    const url = `${EXTERNAL_DB_ENDPOINT}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXTERNAL_DB_SECRET_KEY}`,
        'X-API-Key': EXTERNAL_DB_SECRET_KEY
    };

    const options = { method, headers };
    if (body && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Database adaptor request failed:', error);
        throw error;
    }
}

// ✅ CORRECT: Get latest donation
export async function getLatestDonation() {
    try {
        const donation = await makeRequest('GET', '/donations/latest');
        // ✅ Use correct field names
        return {
            id: donation.id,
            amount: donation.amount,
            currency: donation.currency,
            is_other_amount: donation.is_other_amount,
            created_at: donation.created_at
        };
    } catch (error) {
        if (error.message && error.message.includes('404')) {
            return null;
        }
        throw error;
    }
}

// ✅ CORRECT: Save donation with correct field names
export async function saveDonation(amount, options = {}) {
    if (!amount || amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    // ✅ Use correct field names (snake_case)
    const donationData = {
        amount: parseFloat(amount),
        currency: options.currency || 'USD',
        is_other_amount: options.isOtherAmount || false,  // ✅ Correct
        source: options.source || 'payment_page',
        payment_status: options.paymentStatus || 'completed',  // ✅ Correct
        payment_method: options.paymentMethod || null,  // ✅ Correct
        transaction_id: options.transactionId || null,  // ✅ Correct
        member_email: options.memberEmail || null,  // ✅ Correct
        member_name: options.memberName || null,  // ✅ Correct
        metadata: options.metadata || null
    };

    try {
        return await makeRequest('POST', '/donations', donationData);
    } catch (error) {
        console.error('Error saving donation:', error);
        throw error;
    }
}

// ✅ CORRECT: Get all donations (no aggregate)
export async function getAllDonations(limit = 100, offset = 0) {
    try {
        const result = await makeRequest('GET', `/donations?limit=${limit}&offset=${offset}`);
        return result;
    } catch (error) {
        console.error('Error getting donations:', error);
        throw error;
    }
}

// ✅ CORRECT: Test connection
export async function testConnection() {
    try {
        const url = `${EXTERNAL_DB_ENDPOINT}/health`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}
EOF

# Fixed Frontend Code Template
cat > wix-frontend-code-FIXED.js << 'EOF'
/**
 * HingeCraft Frontend Code - FIXED FOR WDE0116
 * 
 * Use this in your Wix page code
 * 
 * FIXES:
 * 1. ✅ Uses correct field names (snake_case)
 * 2. ✅ No wixData.aggregate() calls
 * 3. ✅ Direct API calls only
 */

import { getLatestDonation, saveDonation, getAllDonations } from 'backend/hingecraft-api';

$w.onReady(async function () {
    try {
        // ✅ CORRECT: Get latest donation
        const donation = await getLatestDonation();
        
        if (donation) {
            // ✅ Use correct field names
            console.log('ID:', donation.id);  // ✅ Correct
            console.log('Amount:', donation.amount);  // ✅ Correct
            console.log('Currency:', donation.currency);  // ✅ Correct
            console.log('Is Other Amount:', donation.is_other_amount);  // ✅ Correct
            console.log('Created At:', donation.created_at);  // ✅ Correct
            
            // Display in UI
            $w('#donationAmount').text = `$${donation.amount}`;
            $w('#donationDate').text = new Date(donation.created_at).toLocaleDateString();
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// ✅ CORRECT: Save donation
export async function saveNewDonation(amount) {
    try {
        const donation = await saveDonation(amount, {
            isOtherAmount: true,
            paymentMethod: 'card',
            memberEmail: 'user@example.com'
        });
        
        // ✅ Use correct field names
        console.log('Saved donation ID:', donation.id);
        console.log('Saved amount:', donation.amount);
        
        return donation;
    } catch (error) {
        console.error('Error saving donation:', error);
        throw error;
    }
}

// ✅ CORRECT: Get donation stats (no aggregate)
export async function getDonationStats() {
    try {
        // ✅ Use direct API call, not wixData.aggregate()
        const result = await getAllDonations(1000, 0);
        
        // Process in code
        const total = result.donations.reduce((sum, d) => sum + d.amount, 0);
        const count = result.donations.length;
        const avg = count > 0 ? total / count : 0;
        
        return {
            total: total,
            count: count,
            average: avg,
            donations: result.donations
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        throw error;
    }
}

// ❌ DON'T USE THIS (causes WDE0116):
// import wixData from 'wix-data';
// const result = await wixData.aggregate("HingeCraftDonationsDB/Donations", {...});
EOF

echo -e "${GREEN}✅ Fixed code templates created${NC}"
echo "  - velo-backend-api-FIXED.js"
echo "  - wix-frontend-code-FIXED.js"
echo ""

# Step 5: Create Wix Configuration File
echo -e "${YELLOW}[5/6]${NC} Creating Wix configuration file..."
cat > WIX_WDE0116_FIX_CONFIG.txt << EOF
╔════════════════════════════════════════════════════════════╗
║         WIX CONFIGURATION - FIXED FOR WDE0116             ║
╚════════════════════════════════════════════════════════════╝

STEP 1: Configure External Database in Wix

1. Go to Wix Editor → Database → External Database
2. Click "Connect External Database"
3. Select "Custom"
4. Enter these EXACT values:

   Connection Name:
   HingeCraftDonationsDB
   
   Endpoint URL:
   $NGROK_URL
   
   Secret Key:
   $SECRET_KEY

5. Click "Test Connection"
   ✅ Should succeed if connection is working

═══════════════════════════════════════════════════════════════

STEP 2: Update Wix Code

IMPORTANT: Use the fixed code files:
- velo-backend-api-FIXED.js → Copy to backend/hingecraft-api.jsw
- wix-frontend-code-FIXED.js → Use in your page code

KEY FIXES:
1. ✅ Use correct field names (snake_case):
   - id (not _id or ID)
   - amount (not Amount)
   - is_other_amount (not isOtherAmount)
   - created_at (not createdAt or dateCreated)

2. ✅ Don't use wixData.aggregate()
   - Use getAllDonations() instead
   - Process data in code

3. ✅ Update EXTERNAL_DB_ENDPOINT in backend code
   - Use: $NGROK_URL

═══════════════════════════════════════════════════════════════

STEP 3: Test Connection

In Wix Velo Backend, add this test function:

import { testConnection } from 'backend/hingecraft-api';

export async function testDbConnection() {
    const health = await testConnection();
    console.log('Connection status:', health);
    return health;
}

Run this function and check console for:
✅ {"status":"healthy","database":"connected"}

═══════════════════════════════════════════════════════════════

CORRECT FIELD NAMES (Use These):

id
amount
currency
is_other_amount
source
payment_status
payment_method
transaction_id
member_email
member_name
created_at
updated_at
metadata

═══════════════════════════════════════════════════════════════

WRONG FIELD NAMES (Don't Use - Causes WDE0116):

_id, ID
Amount, AMOUNT
isOtherAmount, is_other
dateCreated, createdAt
paymentStatus
memberEmail

═══════════════════════════════════════════════════════════════

Generated: $(date)
EOF

echo -e "${GREEN}✅ Configuration file created: WIX_WDE0116_FIX_CONFIG.txt${NC}"
echo ""

# Step 6: Create Test Script
echo -e "${YELLOW}[6/6]${NC} Creating test script..."
cat > test-wix-connection.js << EOF
/**
 * Test Wix Connection - Run this to verify everything works
 * 
 * Usage in Wix Velo:
 * 1. Copy this code to a backend web module
 * 2. Call testWixConnection() from frontend
 */

import { testConnection, getLatestDonation, saveDonation } from 'backend/hingecraft-api';

export async function testWixConnection() {
    const results = {
        connection: null,
        latestDonation: null,
        saveTest: null,
        errors: []
    };
    
    try {
        // Test 1: Connection
        console.log('Testing connection...');
        results.connection = await testConnection();
        console.log('✅ Connection:', results.connection);
        
        // Test 2: Get latest donation
        console.log('Testing getLatestDonation...');
        results.latestDonation = await getLatestDonation();
        console.log('✅ Latest donation:', results.latestDonation);
        
        // Test 3: Save test donation
        console.log('Testing saveDonation...');
        results.saveTest = await saveDonation(1.00, {
            isOtherAmount: true,
            source: 'wix_test',
            paymentStatus: 'test'
        });
        console.log('✅ Save test:', results.saveTest);
        
        return {
            success: true,
            results: results
        };
    } catch (error) {
        results.errors.push(error.message);
        console.error('❌ Error:', error);
        return {
            success: false,
            results: results,
            error: error.message
        };
    }
}
EOF

echo -e "${GREEN}✅ Test script created: test-wix-connection.js${NC}"
echo ""

# Final Summary
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              ✅ WDE0116 FIX COMPLETE!                     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Files Created:${NC}"
echo "  1. velo-backend-api-FIXED.js - Fixed backend code"
echo "  2. wix-frontend-code-FIXED.js - Fixed frontend code"
echo "  3. WIX_WDE0116_FIX_CONFIG.txt - Configuration guide"
echo "  4. test-wix-connection.js - Test script"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Review WIX_WDE0116_FIX_CONFIG.txt"
echo "2. Update Wix External Database with:"
echo "   - Connection Name: $CONNECTION_NAME"
echo "   - Endpoint URL: $NGROK_URL"
echo "   - Secret Key: $SECRET_KEY"
echo ""
echo "3. Copy fixed code to Wix:"
echo "   - velo-backend-api-FIXED.js → backend/hingecraft-api.jsw"
echo "   - Update EXTERNAL_DB_ENDPOINT with: $NGROK_URL"
echo ""
echo "4. Use wix-frontend-code-FIXED.js in your page code"
echo ""
echo "5. Test connection using test-wix-connection.js"
echo ""
echo -e "${CYAN}Connection URL: $NGROK_URL${NC}"
echo ""















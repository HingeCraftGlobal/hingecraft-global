#!/bin/bash

# HingeCraft Docker PostgreSQL URL Extraction
# Extracts payment URLs from Docker PostgreSQL database
# 
# This script connects to the Docker PostgreSQL container
# and exports payment data to CSV files

set -e

echo "🔍 HingeCraft Docker PostgreSQL Extraction"
echo "=========================================="
echo ""

# Configuration - Update based on your docker-compose.yml
DB_CONTAINER="${DB_CONTAINER:-hingecraft-postgres}"  # From ML Automation system
# OR: DB_CONTAINER="${DB_CONTAINER:-hingecraft-chat-db}"  # From root docker-compose
DB_NAME="${DB_NAME:-hingecraft_automation}"  # OR: hingecraft_chat
DB_USER="${DB_USER:-hingecraft_user}"  # OR: hingecraft
DB_PORT="${DB_PORT:-7543}"  # External port from docker-compose

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo "❌ Container '${DB_CONTAINER}' not found."
    echo "Available containers:"
    docker ps -a --format '{{.Names}}'
    exit 1
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo "⚠️  Container '${DB_CONTAINER}' is not running. Starting it..."
    docker start "${DB_CONTAINER}"
    echo "⏳ Waiting for database to be ready..."
    sleep 5
fi

echo "✅ Connected to Docker container: ${DB_CONTAINER}"
echo "📊 Database: ${DB_NAME}"
echo "👤 User: ${DB_USER}"
echo ""

# Create output directory
OUTPUT_DIR="/tmp/hingecraft_extraction_$(date +%Y%m%d_%H%M%S)"
mkdir -p "${OUTPUT_DIR}"

echo "📁 Output directory: ${OUTPUT_DIR}"
echo ""

# Function to run SQL query and export to CSV
run_query() {
    local query_name=$1
    local sql_query=$2
    local output_file="${OUTPUT_DIR}/${query_name}.csv"
    
    echo "🔍 Extracting ${query_name}..."
    
    # Use docker exec to run psql inside container
    docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "\copy (${sql_query}) TO '/tmp/${query_name}.csv' CSV HEADER;" 2>&1
    
    # Copy file from container to host
    docker cp "${DB_CONTAINER}:/tmp/${query_name}.csv" "${output_file}" 2>&1
    
    if [ -f "${output_file}" ]; then
        local line_count=$(wc -l < "${output_file}" | tr -d ' ')
        echo "   ✅ Exported ${line_count} lines to ${output_file}"
    else
        echo "   ⚠️  File not created (table might not exist)"
    fi
}

# Check if tables exist first
echo "🔍 Checking database schema..."
TABLES=$(docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" 2>/dev/null | tr -d ' ')

echo "Found tables:"
echo "${TABLES}" | while read table; do
    if [ -n "${table}" ]; then
        echo "  - ${table}"
    fi
done
echo ""

# Extract payments (if table exists)
if echo "${TABLES}" | grep -q "^payments$"; then
    run_query "hingecraft_payments" "
        SELECT 
            id, created_at, user_id, gateway, payment_url, invoice_url, 
            transaction_id, amount, currency, payment_status, payment_method, metadata
        FROM payments
        WHERE payment_url IS NOT NULL 
           OR invoice_url IS NOT NULL 
           OR metadata::text ILIKE '%http%'
        ORDER BY created_at DESC
    "
else
    echo "⚠️  Table 'payments' not found - skipping"
fi

# Extract wallets (if table exists)
if echo "${TABLES}" | grep -q "^wallets$"; then
    run_query "hingecraft_wallets" "
        SELECT 
            id, created_at, user_id, wallet_address, coin, currency, network, meta, metadata
        FROM wallets
        WHERE wallet_address IS NOT NULL
        ORDER BY created_at DESC
    "
else
    echo "⚠️  Table 'wallets' not found - skipping"
fi

# Extract external_payments (if table exists)
if echo "${TABLES}" | grep -q "^external_payments$"; then
    run_query "hingecraft_external_payments" "
        SELECT 
            id, created_at, updated_at, gateway, provider_id, provider_payload, 
            metadata, status, amount, currency
        FROM external_payments
        WHERE gateway ILIKE '%stripe%' 
           OR gateway ILIKE '%nowpayment%'
        ORDER BY created_at DESC
    "
else
    echo "⚠️  Table 'external_payments' not found - skipping"
fi

# Extract CryptoPayments (if table exists - note: case sensitive in PostgreSQL)
if echo "${TABLES}" | grep -q "^CryptoPayments$" || echo "${TABLES}" | grep -qi "cryptopayments"; then
    run_query "hingecraft_crypto_payments" "
        SELECT 
            _id, intent_id, order_id, invoice_id, payment_url, pay_address,
            pay_amount_crypto, pay_currency, price_amount, price_currency,
            status, nowpayments_status, invoice_created_at, invoice_expires_at,
            payment_confirmed_at, raw_response, metadata
        FROM \"CryptoPayments\"
        WHERE payment_url IS NOT NULL
           OR pay_address IS NOT NULL
           OR invoice_id IS NOT NULL
        ORDER BY invoice_created_at DESC
    "
else
    echo "⚠️  Table 'CryptoPayments' not found - skipping"
fi

# Extract StripePayments (if table exists)
if echo "${TABLES}" | grep -q "^StripePayments$" || echo "${TABLES}" | grep -qi "stripepayments"; then
    run_query "hingecraft_stripe_payments" "
        SELECT 
            _id, session_id, amount, currency, status, payment_method,
            checkout_url, success_url, cancel_url, metadata, created_at
        FROM \"StripePayments\"
        WHERE checkout_url IS NOT NULL
           OR session_id IS NOT NULL
        ORDER BY created_at DESC
    "
else
    echo "⚠️  Table 'StripePayments' not found - skipping"
fi

echo ""
echo "✅ Extraction complete!"
echo "📁 All files saved to: ${OUTPUT_DIR}"
echo ""
echo "📋 Summary:"
ls -lh "${OUTPUT_DIR}"/*.csv 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo "💡 Next steps:"
echo "   1. Review the CSV files"
echo "   2. Update payment-currency-map.json with URLs"
echo "   3. Update PAYMENT_ROUTES in charter-page-wix-ready.html"

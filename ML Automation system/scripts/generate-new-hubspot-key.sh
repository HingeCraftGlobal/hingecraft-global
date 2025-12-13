#!/bin/bash

# Generate New HubSpot Personal Access Key
# This script helps you generate a new Personal Access Key

echo "🔐 HUBSPOT PERSONAL ACCESS KEY GENERATOR"
echo "========================================="
echo ""

# Check if CLI is installed
if ! command -v hs &> /dev/null; then
    echo "📦 Installing HubSpot CLI..."
    npm install -g @hubspot/cli
fi

echo ""
echo "📋 Step 1: Initialize HubSpot CLI"
echo "   This will open a browser for authentication"
echo ""
read -p "Press Enter to continue..."

hs init

echo ""
echo "📋 Step 2: Generate Personal Access Key"
echo ""
read -p "Press Enter to generate key..."

hs auth personal-access-key

echo ""
echo "✅ Copy the Personal Access Key shown above"
echo ""
echo "📋 Step 3: Update config/api_keys.js"
echo "   Replace personalAccessKey with the new key"
echo ""
echo "📋 Step 4: Test connection"
echo "   Run: node scripts/test-hubspot-connection.js"
echo ""

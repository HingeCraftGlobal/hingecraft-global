#!/bin/bash

# Get New HubSpot Personal Access Key
# This script guides you through generating a new key

echo "🔐 HUBSPOT PERSONAL ACCESS KEY GENERATOR"
echo "========================================="
echo ""

echo "📋 Step 1: Generate Key in HubSpot UI"
echo "--------------------------------------"
echo ""
echo "1. Go to: https://app-na2.hubspot.com/settings/integrations/private-apps"
echo "2. Click 'Create a private app' (or edit existing)"
echo "3. Name: 'Automation System'"
echo "4. Go to 'Scopes' tab and grant:"
echo "   - CRM → Read & Write"
echo "   - Custom Objects → Read & Write"
echo "   - Schemas → Read & Write"
echo "5. Go to 'Auth' tab"
echo "6. Click 'Generate token'"
echo "7. Copy the Personal Access Token"
echo ""
read -p "Press Enter when you have copied the token..."

echo ""
echo "📋 Step 2: Authenticate CLI"
echo "---------------------------"
echo ""
echo "Paste your Personal Access Key when prompted:"
echo ""

hs auth --auth-type personalaccesskey --account automation-system

echo ""
echo "📋 Step 3: Get the Key from CLI Config"
echo "--------------------------------------"
echo ""

if [ -f ~/.hscli/config.yml ]; then
    echo "CLI Config found. Extracting key..."
    KEY=$(grep -A 5 "automation-system" ~/.hscli/config.yml | grep "personalAccessKey" | awk '{print $2}' | tr -d '"')
    if [ ! -z "$KEY" ]; then
        echo ""
        echo "✅ Personal Access Key found:"
        echo "$KEY"
        echo ""
        echo "📋 Step 4: Update config/api_keys.js"
        echo "-----------------------------------"
        echo ""
        echo "Update the personalAccessKey field with:"
        echo "$KEY"
        echo ""
        read -p "Press Enter to open config file..."
        open config/api_keys.js || code config/api_keys.js || nano config/api_keys.js
    else
        echo "⚠️  Key not found in config. Please update manually."
    fi
else
    echo "⚠️  CLI config not found. Please update config/api_keys.js manually."
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Step 5: Test Connection"
echo "   Run: node scripts/test-hubspot-connection.js"
echo ""
echo "📋 Step 6: Launch Sync"
echo "   Run: node scripts/hubspot-full-sync.js"
echo ""

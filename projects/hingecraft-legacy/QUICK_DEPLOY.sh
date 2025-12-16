#!/bin/bash

# Quick Deploy - Opens all necessary files and instructions

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Quick Deploy - Opening Deployment Files${NC}"
echo "============================================="
echo ""

# Find latest deployment package
DEPLOY_PKG=$(ls -td wix-deployment-ready-* 2>/dev/null | head -1)

if [ -z "$DEPLOY_PKG" ]; then
    echo "Creating deployment package..."
    ./AUTOMATE_WIX_DEPLOYMENT.sh
    DEPLOY_PKG=$(ls -td wix-deployment-ready-* 2>/dev/null | head -1)
fi

echo -e "${GREEN}📦 Deployment Package:${NC} $DEPLOY_PKG"
echo ""

# Open files
if command -v open &> /dev/null; then
    echo "Opening deployment instructions..."
    open "$DEPLOY_PKG/DEPLOYMENT_INSTRUCTIONS.md"
    
    echo "Opening deployment files..."
    open "$DEPLOY_PKG"
    
    echo ""
    echo -e "${GREEN}✅ Files opened!${NC}"
    echo ""
    echo "Follow the instructions in: $DEPLOY_PKG/DEPLOYMENT_INSTRUCTIONS.md"
else
    echo "Files ready in: $DEPLOY_PKG"
    echo "Open: $DEPLOY_PKG/DEPLOYMENT_INSTRUCTIONS.md"
fi









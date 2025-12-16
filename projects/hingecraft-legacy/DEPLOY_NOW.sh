#!/bin/bash
# One-command deployment - Opens everything you need

clear
echo "🚀 Quick Deploy - Opening All Files"
echo "===================================="
echo ""

# Find latest deployment package
DEPLOY_PKG=$(ls -td wix-deployment-ready-* 2>/dev/null | head -1)

if [ -z "$DEPLOY_PKG" ]; then
    echo "Creating deployment package..."
    ./AUTOMATE_WIX_DEPLOYMENT.sh
    DEPLOY_PKG=$(ls -td wix-deployment-ready-* 2>/dev/null | head -1)
fi

echo "📦 Deployment Package: $DEPLOY_PKG"
echo ""
echo "📋 Files Ready:"
echo "  1. $DEPLOY_PKG/DEPLOYMENT_INSTRUCTIONS.md (FOLLOW THIS)"
echo "  2. $DEPLOY_PKG/velo-backend-api.js"
echo "  3. $DEPLOY_PKG/payment-page-integration-FIXED.js"
echo "  4. $DEPLOY_PKG/CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html"
echo ""

# Open files if on macOS
if command -v open &> /dev/null; then
    echo "Opening files..."
    open "$DEPLOY_PKG/DEPLOYMENT_INSTRUCTIONS.md"
    open "$DEPLOY_PKG"
    echo "✅ Files opened!"
else
    echo "Open manually: $DEPLOY_PKG/DEPLOYMENT_INSTRUCTIONS.md"
fi

echo ""
echo "🚀 Next: Follow the instructions in DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo "Or run: ./INTERACTIVE_WIX_DEPLOY.sh for guided deployment"

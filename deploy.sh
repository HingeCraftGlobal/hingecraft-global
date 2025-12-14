#!/bin/bash
# Wix CLI Deployment Script
# Deploys all backend files to Wix

set -e  # Exit on error

echo "🚀 Starting Wix CLI Deployment..."
echo ""

# Check if Wix CLI is installed
if ! command -v wix &> /dev/null; then
    echo "❌ Wix CLI not found. Installing..."
    npm install -g @wix/cli
    echo "✅ Wix CLI installed"
fi

# Navigate to project directory
cd "$(dirname "$0")"
echo "📁 Project directory: $(pwd)"
echo ""

# Check if logged in
echo "🔐 Checking Wix authentication..."
if ! wix whoami &> /dev/null; then
    echo "⚠️  Not logged in. Please run: wix login"
    echo "Opening login..."
    wix login
fi

echo "✅ Authenticated as: $(wix whoami)"
echo ""

# Deploy backend files
echo "📤 Deploying backend files..."
wix deploy src/backend --source local || {
    echo "⚠️  Deploy from src/backend failed, trying individual files..."
    # Fallback: deploy key files individually
    wix deploy src/backend/master-initialization.jsw --source local
    wix deploy src/backend/master-initialization.web.js --source local
    wix deploy src/backend/system-utilities.jsw --source local
    wix deploy src/backend/system-utilities.web.js --source local
}

echo ""

# Deploy webhooks
echo "📤 Deploying webhook files..."
if [ -d "src/backend/webhooks" ]; then
    wix deploy src/backend/webhooks --source local || {
        echo "⚠️  Webhook deploy failed, trying individual file..."
        wix deploy src/backend/webhooks/stripe.jsw --source local
    }
fi

echo ""

# Publish site
echo "📢 Publishing site to test environment..."
wix publish --source remote --target test || {
    echo "⚠️  Publish failed, trying without target..."
    wix publish --source remote
}

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Next steps:"
echo "1. Test health check: fetch('/_functions/master-initialization/quickHealthCheck')"
echo "2. Run master initialization"
echo "3. Verify all systems working"
echo ""
echo "📚 See BACKEND_TESTING_GUIDE.md for testing procedures"

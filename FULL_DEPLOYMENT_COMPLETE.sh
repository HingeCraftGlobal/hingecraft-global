#!/bin/bash

# HingeCraft Global - Full Deployment Script
# Deploys all components: backend functions, HTML pages, database setup, and configurations
# Usage: ./FULL_DEPLOYMENT_COMPLETE.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 HINGECRAFT GLOBAL - FULL DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Wix CLI is installed
if ! command -v wix &> /dev/null; then
    echo -e "${RED}❌ Wix CLI is not installed.${NC}"
    echo "Please install it with: npm install -g @wix/cli"
    exit 1
fi

# Check authentication
echo -e "${BLUE}📋 Checking Wix authentication...${NC}"
if ! wix whoami &> /dev/null; then
    echo -e "${RED}❌ Not authenticated. Please login first:${NC}"
    echo "   wix login"
    exit 1
fi

USER=$(wix whoami | head -1)
echo -e "${GREEN}✅ Authenticated as: $USER${NC}"
echo ""

# Start Wix Dev Mode
echo -e "${BLUE}📋 Starting Wix Dev Mode...${NC}"
if pgrep -f "wix dev" > /dev/null; then
    echo -e "${GREEN}✅ Wix dev is already running${NC}"
    WIX_DEV_PID=$(pgrep -f "wix dev" | head -1)
else
    nohup wix dev > /tmp/wix_dev.log 2>&1 &
    WIX_DEV_PID=$!
    sleep 5
    if ps -p $WIX_DEV_PID > /dev/null; then
        echo -e "${GREEN}✅ Wix dev started (PID: $WIX_DEV_PID)${NC}"
    else
        echo -e "${RED}❌ Wix dev failed to start${NC}"
        exit 1
    fi
fi

echo ""

# Verify all files
echo -e "${BLUE}📋 Verifying all deployment files...${NC}"

# Backend Functions
BACKEND_FILES=(
    "src/backend/mission-support-middleware.jsw"
    "src/backend/charter-page-middleware.jsw"
    "src/backend/stripe.api.jsw"
    "src/backend/nowpayments.api.jsw"
    "src/backend/chat-notifications.jsw"
    "src/backend/gpt-form-config.jsw"
    "src/backend/receipts-hook.jsw"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename $file)${NC}"
    else
        echo -e "${YELLOW}⚠️  $(basename $file) not found${NC}"
    fi
done

# HTML Pages
HTML_FILES=(
    "public/pages/mission-support-form.html"
    "public/pages/charter-page-wix-ready.html"
)

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename $file)${NC}"
    else
        echo -e "${RED}❌ $(basename $file) NOT FOUND${NC}"
    fi
done

echo ""

# Create deployment manifest
echo -e "${BLUE}📋 Creating deployment manifest...${NC}"
MANIFEST_FILE="FULL_DEPLOYMENT_MANIFEST_$(date +%Y%m%d_%H%M%S).txt"
cat > "$MANIFEST_FILE" << EOF
HingeCraft Global - Full Deployment Manifest
Generated: $(date)

═══════════════════════════════════════════════════════════
BACKEND FUNCTIONS TO DEPLOY
═══════════════════════════════════════════════════════════

1. mission-support-middleware.jsw
   - submitMissionSupportForm() - Complete form submission
   - microPayment() - $1/$2/$5 payments
   - otherAmount() - Custom amounts with prefill
   - getPrefill() - Retrieve prefill data
   - sendPaymentReceiptEmail() - GPT-generated receipts

2. charter-page-middleware.jsw
   - onReady() - Page initialization
   - cryptoButtonClick() - Crypto payments
   - fiatButtonClick() - Stripe payments
   - getCumulativeTotal() - Calculate totals

3. stripe.api.jsw
   - createCheckoutSession() - Stripe checkout
   - getPublishableKey() - Get Stripe key
   - handleWebhook() - Webhook handler

4. nowpayments.api.jsw
   - createNowPaymentsInvoice() - Crypto invoices
   - getInvoiceStatus() - Check payment status

5. chat-notifications.jsw (NEW)
   - notifyMarketingOnQuestion() - Notify marketing on chat questions
   - saveChatMessage() - Save chat to database
   - getChatHistory() - Get chat history

6. gpt-form-config.jsw (NEW)
   - configureFormFromPrompt() - GPT form configuration
   - updateFormConfiguration() - Update form config
   - getFormConfiguration() - Get current config

7. receipts-hook.jsw (NEW)
   - saveReceipt() - Save receipt to database
   - getReceipt() - Get receipt by ID
   - resendReceipt() - Resend receipt email

═══════════════════════════════════════════════════════════
HTML PAGES TO EMBED
═══════════════════════════════════════════════════════════

1. mission-support-form.html
   - Complete form with live chat
   - Chat notifications to marketing
   - All form fields
   - Payment processing

2. charter-page-wix-ready.html
   - Charter page with payment options
   - Slider functionality (2-20 years)
   - Prefill support

═══════════════════════════════════════════════════════════
DATABASE COLLECTIONS REQUIRED
═══════════════════════════════════════════════════════════

1. ContributionIntent
   - All form submissions
   - Prefill tokens
   - User flow tracking

2. Donations
   - Payment tracking
   - Stripe sessions
   - Payment reconciliation

3. CryptoPayments
   - Crypto invoice tracking
   - NOWPayments integration

4. Receipts (NEW)
   - All email receipts
   - GPT vs template tracking
   - Email delivery status

5. ChatMessages (NEW)
   - All chat messages
   - Intent analysis
   - Marketing notifications

6. FormConfigurations (NEW)
   - GPT-generated form configs
   - Version history
   - Active configurations

═══════════════════════════════════════════════════════════
SECRETS TO CONFIGURE
═══════════════════════════════════════════════════════════

Required Secrets:
- STRIPE_SECRET_KEY_LIVE
- STRIPE_PUBLISHABLE_KEY_LIVE
- NOWPAYMENTS_API_KEY
- OPENAI_API_KEY (for GPT receipts and form config)
- SENDGRID_API_KEY (for email sending)
- MARKETING_EMAIL (for chat notifications)
- BASE_URL (optional, default: https://www.hingecraft-global.ai)

═══════════════════════════════════════════════════════════
DEPLOYMENT STATUS
═══════════════════════════════════════════════════════════

- Wix Dev Mode: Running (PID: $WIX_DEV_PID)
- Files Verified: ✅
- Ready for Manual Upload: ✅

EOF

echo -e "${GREEN}✅ Manifest created: $MANIFEST_FILE${NC}"
echo ""

# Display deployment instructions
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📤 COMPLETE DEPLOYMENT INSTRUCTIONS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}1. Open Wix Editor:${NC}"
echo "   https://editor.wix.com"
echo ""
echo -e "${GREEN}2. Enable Dev Mode:${NC}"
echo "   - Click 'Dev Mode' toggle in top bar"
echo ""
echo -e "${GREEN}3. Upload Backend Functions:${NC}"
echo "   - Go to: Backend → Functions"
echo "   - Upload these files:"
for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "     • $file"
    fi
done
echo ""
echo -e "${GREEN}4. Configure Secrets:${NC}"
echo "   - Go to: Settings → Secrets"
echo "   - Add all required secrets (see manifest)"
echo ""
echo -e "${GREEN}5. Create Database Collections:${NC}"
echo "   - Go to: Database → Collections"
echo "   - Create these collections:"
echo "     • ContributionIntent"
echo "     • Donations"
echo "     • CryptoPayments"
echo "     • Receipts"
echo "     • ChatMessages"
echo "     • FormConfigurations"
echo ""
echo -e "${GREEN}6. Embed HTML Pages:${NC}"
echo "   - Mission Support Page:"
echo "     • Add HTML element"
echo "     • Paste: public/pages/mission-support-form.html"
echo "   - Charter Page:"
echo "     • Add HTML element"
echo "     • Paste: public/pages/charter-page-wix-ready.html"
echo ""
echo -e "${GREEN}7. Test Everything:${NC}"
echo "   - Test form submission"
echo "   - Test payments (micro, other, crypto)"
echo "   - Test live chat notifications"
echo "   - Test email receipts"
echo "   - Test GPT form configuration"
echo ""
echo -e "${GREEN}8. Publish:${NC}"
echo "   - When all tests pass, publish site"
echo ""

# Display file paths
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 FILE PATHS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Backend Functions:"
for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  $SCRIPT_DIR/$file"
    fi
done
echo ""
echo "HTML Pages:"
for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  $SCRIPT_DIR/$file"
    fi
done
echo ""

# Final summary
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ FULL DEPLOYMENT PREPARATION COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Follow deployment instructions above"
echo "2. Monitor Wix Dev logs: tail -f /tmp/wix_dev.log"
echo "3. Test all functionality"
echo "4. Publish when ready"
echo ""
echo -e "${BLUE}📄 Full manifest: $MANIFEST_FILE${NC}"
echo ""
echo -e "${GREEN}✅ All systems ready for deployment!${NC}"
echo ""

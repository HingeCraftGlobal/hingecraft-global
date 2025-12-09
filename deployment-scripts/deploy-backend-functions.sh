#!/bin/bash

# Deploy Backend Functions to Wix
# This script prepares backend functions for easy copy-paste into Wix Editor

echo "=== 🚀 Backend Functions Deployment Helper ==="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BACKEND_DIR="backend-functions"
OUTPUT_DIR="deployment-ready"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "📦 Preparing backend functions for deployment..."
echo ""

# List of files to prepare
FILES=(
    "hingecraft.api.web.jsw"
    "nowpayments.api.jsw"
    "createNowPaymentsInvoice.jsw"
    "email-templates.jsw"
    "reconciliation-worker.jsw"
    "notion-crm-sync.jsw"
)

WEBHOOK_FILE="nowpayments.jsw"
WEBHOOK_SOURCE="backend-functions/webhooks/nowpayments.jsw"

# Copy and prepare each file
for file in "${FILES[@]}"; do
    if [ -f "$BACKEND_DIR/$file" ]; then
        cp "$BACKEND_DIR/$file" "$OUTPUT_DIR/$file"
        size=$(wc -c < "$BACKEND_DIR/$file" | tr -d ' ')
        echo -e "${GREEN}✅${NC} Prepared: $file ($(numfmt --to=iec-i --suffix=B $size 2>/dev/null || echo "${size}B"))"
    else
        echo -e "${YELLOW}⚠️${NC}  Missing: $file"
    fi
done

# Handle webhook file
if [ -f "$WEBHOOK_SOURCE" ]; then
    mkdir -p "$OUTPUT_DIR/webhooks"
    cp "$WEBHOOK_SOURCE" "$OUTPUT_DIR/webhooks/nowpayments.jsw"
    size=$(wc -c < "$WEBHOOK_SOURCE" | tr -d ' ')
    echo -e "${GREEN}✅${NC} Prepared: webhooks/nowpayments.jsw ($(numfmt --to=iec-i --suffix=B $size 2>/dev/null || echo "${size}B"))"
elif [ -f "$BACKEND_DIR/$WEBHOOK_FILE" ]; then
    mkdir -p "$OUTPUT_DIR/webhooks"
    cp "$BACKEND_DIR/$WEBHOOK_FILE" "$OUTPUT_DIR/webhooks/nowpayments.jsw"
    size=$(wc -c < "$BACKEND_DIR/$WEBHOOK_FILE" | tr -d ' ')
    echo -e "${GREEN}✅${NC} Prepared: webhooks/nowpayments.jsw ($(numfmt --to=iec-i --suffix=B $size 2>/dev/null || echo "${size}B"))"
else
    echo -e "${YELLOW}⚠️${NC}  Missing: webhooks/nowpayments.jsw"
fi

echo ""
echo "=========================================="
echo -e "${BLUE}📋 Deployment Instructions:${NC}"
echo ""
echo "1. Open Wix Editor → Dev Mode → Backend → Web Modules"
echo "2. For each file in $OUTPUT_DIR/:"
echo "   - Click 'Add' → 'Web Module'"
echo "   - Name it exactly as shown"
echo "   - Copy entire content from the file"
echo "   - Paste and save"
echo ""
echo "3. For webhook file:"
echo "   - Create 'webhooks' folder in Backend if needed"
echo "   - Upload webhooks/nowpayments.jsw"
echo ""
echo -e "${GREEN}✅ Files ready in: $OUTPUT_DIR/${NC}"
echo ""

# Create deployment manifest
cat > "$OUTPUT_DIR/DEPLOYMENT_MANIFEST.md" << EOF
# Backend Functions Deployment Manifest

**Generated:** $(date)
**Status:** Ready for Upload

## Files to Upload

### Core Functions
EOF

for file in "${FILES[@]}"; do
    if [ -f "$OUTPUT_DIR/$file" ]; then
        echo "- [ ] \`$file\` → \`backend/$file\`" >> "$OUTPUT_DIR/DEPLOYMENT_MANIFEST.md"
    fi
done

cat >> "$OUTPUT_DIR/DEPLOYMENT_MANIFEST.md" << EOF

### Webhook
- [ ] \`webhooks/nowpayments.jsw\` → \`backend/webhooks/nowpayments.jsw\`

## Upload Order

1. Core API functions first
2. Webhook last

## Verification

After uploading, verify:
- [ ] All functions visible in Functions list
- [ ] No syntax errors
- [ ] Functions can be called from frontend
EOF

echo -e "${GREEN}✅ Deployment manifest created: $OUTPUT_DIR/DEPLOYMENT_MANIFEST.md${NC}"
echo ""
echo "=== ✅ Preparation Complete ==="


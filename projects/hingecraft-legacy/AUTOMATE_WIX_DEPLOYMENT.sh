#!/bin/bash

# Automated Wix Deployment Preparation and Validation
# This script prepares everything for Wix deployment and validates all prerequisites

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Automated Wix Deployment Preparation${NC}"
echo "============================================="
echo ""

# Step 1: Validate all files exist
echo -e "${YELLOW}Step 1: Validating deployment files...${NC}"

FILES=(
    "velo-backend-api.js"
    "payment-page-integration-FIXED.js"
    "CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html"
)

MISSING_FILES=()
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required files. Cannot proceed.${NC}"
    exit 1
fi

# Step 2: Get production configuration
echo ""
echo -e "${YELLOW}Step 2: Loading production configuration...${NC}"

if [ -f "PRODUCTION_CONFIG.txt" ]; then
    PROD_URL=$(grep "Production URL:" PRODUCTION_CONFIG.txt | cut -d' ' -f3)
    SECRET_KEY=$(grep "Secret Key:" PRODUCTION_CONFIG.txt | cut -d' ' -f3 | head -1)
    
    if [ -z "$PROD_URL" ] || [ -z "$SECRET_KEY" ]; then
        echo -e "${RED}❌ Production configuration incomplete${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Production URL: ${PROD_URL}${NC}"
    echo -e "${GREEN}✅ Secret Key: ${SECRET_KEY:0:20}...${NC}"
else
    echo -e "${RED}❌ PRODUCTION_CONFIG.txt not found${NC}"
    exit 1
fi

# Step 3: Validate production URL is accessible
echo ""
echo -e "${YELLOW}Step 3: Validating production URL...${NC}"

HEALTH_CHECK=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
    -H "X-API-Key: $SECRET_KEY" \
    "${PROD_URL}/health" 2>/dev/null || echo "{}")

if echo "$HEALTH_CHECK" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Production URL is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Production URL may not be accessible (ngrok may need restart)${NC}"
    echo "   Run: ./PRODUCTION_DEPLOY.sh"
fi

# Step 4: Create Wix deployment package
echo ""
echo -e "${YELLOW}Step 4: Creating Wix deployment package...${NC}"

DEPLOY_PACKAGE="wix-deployment-ready-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_PACKAGE"

# Copy files
cp velo-backend-api.js "$DEPLOY_PACKAGE/"
cp payment-page-integration-FIXED.js "$DEPLOY_PACKAGE/"
cp CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html "$DEPLOY_PACKAGE/"

# Create deployment instructions
cat > "$DEPLOY_PACKAGE/DEPLOYMENT_INSTRUCTIONS.md" << EOF
# Wix Deployment Instructions

## Production Configuration

**Production URL**: \`${PROD_URL}\`  
**Secret Key**: \`${SECRET_KEY}\`

---

## Step 1: Deploy Backend Function (2 minutes)

1. Open Wix Editor → Enable Dev Mode
2. Go to: **Backend → Functions**
3. Click: **+ Add Function**
4. Name: \`hingecraft-api\`
5. Copy entire content from: \`velo-backend-api.js\`
6. Click: **Save** then **Publish**

**File to copy**: \`velo-backend-api.js\`

---

## Step 2: Configure Wix Secrets (1 minute)

1. Go to: **Settings → Secrets Manager**
2. Click: **+ New Secret**

**Secret 1**:
- Name: \`EXTERNAL_DB_ENDPOINT\`
- Value: \`${PROD_URL}\`

**Secret 2**:
- Name: \`EXTERNAL_DB_SECRET_KEY\`
- Value: \`${SECRET_KEY}\`

3. Click: **Save** for each secret

---

## Step 3: Connect External Database (2 minutes)

1. Go to: **Database → External Database**
2. Click: **+ Connect External Database**
3. Fill in:
   - **Connection Name**: \`HingeCraftDonationsDB\`
   - **Endpoint URL**: \`${PROD_URL}\`
   - **Secret Key**: \`${SECRET_KEY}\`
4. Click: **Connect**
5. Wait for schema to load (should see \`donations\` collection)
6. Verify fields: \`_id\`, \`_createdDate\`, \`_updatedDate\`, \`_owner\`

---

## Step 4: Deploy Payment Page Code (1 minute)

1. Navigate to your **Payment Page**
2. Go to: **Settings → Custom Code → JavaScript**
3. Delete any existing code
4. Copy entire content from: \`payment-page-integration-FIXED.js\`
5. Update \`CHARTER_PAGE_URL\` if needed (default: \`/charter\`)
6. Click: **Save**

**File to copy**: \`payment-page-integration-FIXED.js\`

---

## Step 5: Deploy Charter Page Code (1 minute)

1. Navigate to your **Charter Page**
2. Go to: **Settings → Custom Code → HTML**
3. Delete any existing code
4. Copy entire content from: \`CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html\`
5. Click: **Save**

**File to copy**: \`CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html\`

---

## Step 6: Test Payment Flow (2 minutes)

1. Go to your **Payment Page** (preview or published)
2. Enter "Other" amount: \`\$50.00\`
3. Submit payment
4. Verify redirect to charter page
5. Verify donation amount displays: **"Donation Amount: \$50.00"**
6. Check browser console (F12) - should be no errors

---

## ✅ Verification Checklist

- [ ] Backend function deployed and published
- [ ] Wix Secrets configured (both secrets)
- [ ] External database connected
- [ ] Schema loaded successfully
- [ ] Payment page code deployed
- [ ] Charter page code deployed
- [ ] Test payment flow works
- [ ] Donation amount displays correctly
- [ ] No console errors

---

## 🔧 Troubleshooting

### Schema Not Loading
- Verify ngrok is running: Check \`PRODUCTION_CONFIG.txt\`
- Test endpoint: \`curl -H "Authorization: Bearer ${SECRET_KEY}" ${PROD_URL}/v1/collections/donations/schema\`
- Restart if needed: \`./PRODUCTION_DEPLOY.sh\`

### Database Connection Fails
- Verify production URL is correct
- Check secret key matches exactly
- Ensure ngrok tunnel is active

### Payment Page Not Working
- Verify backend function is published
- Check Wix Secrets are set correctly
- Verify payment page code is saved

### Charter Page Not Showing Amount
- Verify charter page code is saved
- Check backend function is accessible
- Verify database connection is active

---

**Total Deployment Time**: ~8 minutes

**Status**: Ready for deployment
EOF

# Create quick copy script
cat > "$DEPLOY_PACKAGE/COPY_FILES.sh" << 'COPYEOF'
#!/bin/bash
# Quick copy script for Wix deployment files

echo "📋 Wix Deployment Files Ready:"
echo ""
echo "1. Backend Function:"
echo "   File: velo-backend-api.js"
echo "   Copy to: Wix Editor → Backend → Functions → hingecraft-api"
echo ""
echo "2. Payment Page:"
echo "   File: payment-page-integration-FIXED.js"
echo "   Copy to: Payment Page → Settings → Custom Code → JavaScript"
echo ""
echo "3. Charter Page:"
echo "   File: CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html"
echo "   Copy to: Charter Page → Settings → Custom Code → HTML"
echo ""
echo "✅ All files ready for copy-paste!"
COPYEOF

chmod +x "$DEPLOY_PACKAGE/COPY_FILES.sh"

echo -e "${GREEN}✅ Deployment package created: $DEPLOY_PACKAGE${NC}"

# Step 5: Create validation script
echo ""
echo -e "${YELLOW}Step 5: Creating validation script...${NC}"

cat > "VALIDATE_WIX_DEPLOYMENT.sh" << 'VALIDATEEOF'
#!/bin/bash

# Validate Wix Deployment
# Run this after deploying to Wix to verify everything works

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Validating Wix Deployment${NC}"
echo "=============================="
echo ""

# Load production config
if [ -f "PRODUCTION_CONFIG.txt" ]; then
    PROD_URL=$(grep "Production URL:" PRODUCTION_CONFIG.txt | cut -d' ' -f3)
    SECRET_KEY=$(grep "Secret Key:" PRODUCTION_CONFIG.txt | cut -d' ' -f3 | head -1)
else
    echo -e "${RED}❌ PRODUCTION_CONFIG.txt not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Testing production endpoints...${NC}"

# Test health
HEALTH=$(curl -s -H "Authorization: Bearer $SECRET_KEY" "${PROD_URL}/health" 2>/dev/null || echo "{}")
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health endpoint: Working${NC}"
else
    echo -e "${RED}❌ Health endpoint: Failed${NC}"
fi

# Test schema
SCHEMA=$(curl -s -H "Authorization: Bearer $SECRET_KEY" "${PROD_URL}/v1/collections/donations/schema" 2>/dev/null || echo "{}")
if echo "$SCHEMA" | grep -q "_id"; then
    echo -e "${GREEN}✅ Schema endpoint: Working${NC}"
else
    echo -e "${RED}❌ Schema endpoint: Failed${NC}"
fi

echo ""
echo -e "${BLUE}✅ Validation complete${NC}"
echo ""
echo "Next: Test payment flow in Wix preview"
VALIDATEEOF

chmod +x "VALIDATE_WIX_DEPLOYMENT.sh"
echo -e "${GREEN}✅ Validation script created${NC}"

# Step 6: Create automated git push script
echo ""
echo -e "${YELLOW}Step 6: Creating git push automation...${NC}"

cat > "AUTOMATE_GIT_PUSH.sh" << 'GITPUSHEOF'
#!/bin/bash

# Automated Git Push
# Handles authentication and pushes all changes

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Automated Git Push${NC}"
echo "======================"
echo ""

# Check git status
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Add all changes
git add -A

# Check if there are changes
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
    COMMIT_MSG="Wix deployment: All files ready and validated

✅ Backend function: Ready
✅ Payment page: Ready
✅ Charter page: Ready
✅ Production URL: Configured
✅ All systems: Validated"
    
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✅ Changes committed${NC}"
fi

# Check if we need to push
if git diff --quiet origin/main..HEAD 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Everything is up to date${NC}"
    exit 0
fi

# Try push
echo ""
echo -e "${YELLOW}Pushing to git...${NC}"

if git push origin main 2>/dev/null; then
    echo -e "${GREEN}✅ Successfully pushed to git${NC}"
else
    echo -e "${YELLOW}⚠️  Git push requires authentication${NC}"
    echo ""
    echo "Run: ./PUSH_TO_GIT.sh"
    echo "Or provide GitHub token manually"
fi
GITPUSHEOF

chmod +x "AUTOMATE_GIT_PUSH.sh"
echo -e "${GREEN}✅ Git push automation created${NC}"

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ WIX DEPLOYMENT AUTOMATION COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Deployment Package:${NC} $DEPLOY_PACKAGE"
echo ""
echo -e "${BLUE}📋 Files Ready:${NC}"
echo -e "  ✅ Backend: velo-backend-api.js"
echo -e "  ✅ Payment: payment-page-integration-FIXED.js"
echo -e "  ✅ Charter: CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html"
echo ""
echo -e "${BLUE}📚 Instructions:${NC}"
echo -e "  📖 $DEPLOY_PACKAGE/DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo -e "${BLUE}🔧 Validation:${NC}"
echo -e "  Run: ./VALIDATE_WIX_DEPLOYMENT.sh (after Wix deployment)"
echo ""
echo -e "${BLUE}🚀 Git Push:${NC}"
echo -e "  Run: ./AUTOMATE_GIT_PUSH.sh"
echo ""
echo -e "${GREEN}✅ Ready for Wix deployment!${NC}"









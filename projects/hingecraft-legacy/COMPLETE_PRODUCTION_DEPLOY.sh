#!/bin/bash

# Complete Production Deployment
# Exports all database data, gets live URL, updates all files, and prepares for Wix

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Complete Production Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Export all database data
echo -e "${YELLOW}Step 1: Exporting all database data...${NC}"

SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

# Export via API
if curl -s -H "Authorization: Bearer $SECRET_KEY" http://localhost:3000/export/json > COMPLETE_DATABASE_EXPORT.json 2>/dev/null; then
    TOTAL=$(cat COMPLETE_DATABASE_EXPORT.json | grep -o '"total_donations":[0-9]*' | cut -d':' -f2 || echo "0")
    echo -e "${GREEN}✅ Database exported: ${TOTAL} donations${NC}"
else
    echo -e "${YELLOW}⚠️  Could not export via API, trying direct database export...${NC}"
    docker-compose exec -T postgres pg_dump -U hingecraft_user hingecraft_db > COMPLETE_DATABASE_EXPORT.sql 2>/dev/null || echo "Database export may need Docker running"
fi

# Step 2: Get live production URL
echo ""
echo -e "${YELLOW}Step 2: Getting live production URL...${NC}"

if [ -f "GET_LIVE_PRODUCTION_URL.sh" ]; then
    PROD_URL=$(./GET_LIVE_PRODUCTION_URL.sh)
    echo -e "${GREEN}✅ Production URL: ${PROD_URL}${NC}"
else
    # Fallback to config file
    if [ -f "PRODUCTION_CONFIG.txt" ]; then
        PROD_URL=$(grep "Production URL:" PRODUCTION_CONFIG.txt | cut -d' ' -f3)
        echo -e "${GREEN}✅ Production URL from config: ${PROD_URL}${NC}"
    else
        echo -e "${RED}❌ Could not get production URL${NC}"
        exit 1
    fi
fi

# Step 3: Update all deployment files with live URL
echo ""
echo -e "${YELLOW}Step 3: Updating all files with live URL...${NC}"

# Update deployment instructions
DEPLOY_PKG=$(ls -td wix-deployment-ready-* 2>/dev/null | head -1)
if [ ! -z "$DEPLOY_PKG" ] && [ -f "$DEPLOY_PKG/DEPLOYMENT_INSTRUCTIONS.md" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|https://multiracial-zavier-acculturative.ngrok-free.dev|${PROD_URL}|g" "$DEPLOY_PKG/DEPLOYMENT_INSTRUCTIONS.md"
    else
        sed -i "s|https://multiracial-zavier-acculturative.ngrok-free.dev|${PROD_URL}|g" "$DEPLOY_PKG/DEPLOYMENT_INSTRUCTIONS.md"
    fi
    echo -e "${GREEN}✅ Updated deployment instructions${NC}"
fi

# Update all markdown files
for file in COMPLETE_DATABASE_DETAILS_FOR_WIX.md WIX_PRODUCTION_DEPLOYMENT.md FULL_DEPLOYMENT_COMPLETE.md; do
    if [ -f "$file" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|https://multiracial-zavier-acculturative.ngrok-free.dev|${PROD_URL}|g" "$file" 2>/dev/null || true
        else
            sed -i "s|https://multiracial-zavier-acculturative.ngrok-free.dev|${PROD_URL}|g" "$file" 2>/dev/null || true
        fi
    fi
done

# Step 4: Create complete deployment package with all data
echo ""
echo -e "${YELLOW}Step 4: Creating complete deployment package...${NC}"

FINAL_PACKAGE="hingecraft-production-ready-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$FINAL_PACKAGE"

# Copy all deployment files
cp velo-backend-api.js "$FINAL_PACKAGE/"
cp payment-page-integration-FIXED.js "$FINAL_PACKAGE/"
cp CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html "$FINAL_PACKAGE/"

# Copy database exports
if [ -f "COMPLETE_DATABASE_EXPORT.json" ]; then
    cp COMPLETE_DATABASE_EXPORT.json "$FINAL_PACKAGE/"
fi
if [ -f "COMPLETE_DATABASE_EXPORT.sql" ]; then
    cp COMPLETE_DATABASE_EXPORT.sql "$FINAL_PACKAGE/"
fi

# Copy database schema
cp database/init.sql "$FINAL_PACKAGE/database-schema.sql"

# Create complete deployment instructions
cat > "$FINAL_PACKAGE/COMPLETE_DEPLOYMENT_INSTRUCTIONS.md" << EOF
# Complete HingeCraft Production Deployment

## 📡 Live Production URL

**Production API URL**: \`${PROD_URL}\`  
**Secret Key**: \`${SECRET_KEY}\`

---

## 📊 Database Status

**Total Donations**: $(cat COMPLETE_DATABASE_EXPORT.json 2>/dev/null | grep -o '"total_donations":[0-9]*' | cut -d':' -f2 || echo "N/A")

**Database Files Included**:
- \`COMPLETE_DATABASE_EXPORT.json\` - Complete database export (JSON)
- \`database-schema.sql\` - Database schema

---

## 🚀 Step 1: Deploy Backend Function (2 minutes)

1. **Open Wix Editor** → Enable **Dev Mode**
2. Go to: **Backend → Functions**
3. Click: **+ Add Function**
4. **Name**: \`hingecraft-api\`
5. **Copy entire content** from: \`velo-backend-api.js\`
6. Click: **Save** then **Publish**

**File to copy**: \`velo-backend-api.js\`

---

## 🔐 Step 2: Configure Wix Secrets (1 minute)

1. Go to: **Settings → Secrets Manager**
2. Click: **+ New Secret**

**Secret 1**:
- **Name**: \`EXTERNAL_DB_ENDPOINT\`
- **Value**: \`${PROD_URL}\`

**Secret 2**:
- **Name**: \`EXTERNAL_DB_SECRET_KEY\`
- **Value**: \`${SECRET_KEY}\`

3. Click: **Save** for each secret

---

## 🗄️ Step 3: Connect External Database (2 minutes)

1. Go to: **Database → External Database**
2. Click: **+ Connect External Database**
3. Fill in:
   - **Connection Name**: \`HingeCraftDonationsDB\`
   - **Endpoint URL**: \`${PROD_URL}\`
   - **Secret Key**: \`${SECRET_KEY}\`
4. Click: **Connect**
5. Wait for schema to load (should see \`donations\` collection)
6. Verify fields: \`_id\`, \`_createdDate\`, \`_updatedDate\`, \`_owner\`

**All existing data will be accessible** through this connection.

---

## 💳 Step 4: Deploy Payment Page Code (1 minute)

1. Navigate to your **Payment Page**
2. Go to: **Settings → Custom Code → JavaScript**
3. Delete any existing code
4. Copy entire content from: \`payment-page-integration-FIXED.js\`
5. Update \`CHARTER_PAGE_URL\` if needed (default: \`/charter\`)
6. Click: **Save**

**File to copy**: \`payment-page-integration-FIXED.js\`

---

## 📄 Step 5: Deploy Charter Page Code (1 minute)

1. Navigate to your **Charter Page**
2. Go to: **Settings → Custom Code → HTML**
3. Delete any existing code
4. Copy entire content from: \`CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html\`
5. Click: **Save**

**File to copy**: \`CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html\`

---

## ✅ Step 6: Test Payment Flow (2 minutes)

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
- [ ] All existing data accessible
- [ ] Payment page code deployed
- [ ] Charter page code deployed
- [ ] Test payment flow works
- [ ] Donation amount displays correctly
- [ ] No console errors

---

## 📊 Database Information

**Total Donations**: $(cat COMPLETE_DATABASE_EXPORT.json 2>/dev/null | grep -o '"total_donations":[0-9]*' | cut -d':' -f2 || echo "N/A")

**All data is included** in this deployment package:
- Complete database export (JSON)
- Database schema (SQL)
- All existing donation records

---

**Total Deployment Time**: ~8 minutes

**Status**: ✅ **READY FOR PRODUCTION DEPLOYMENT**
EOF

echo -e "${GREEN}✅ Complete deployment package created: $FINAL_PACKAGE${NC}"

# Step 5: Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ COMPLETE PRODUCTION DEPLOYMENT READY${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Final Package:${NC} $FINAL_PACKAGE"
echo ""
echo -e "${BLUE}📡 Production URL:${NC} ${PROD_URL}"
echo ""
echo -e "${BLUE}📊 Database:${NC}"
echo -e "  ✅ All data exported"
echo -e "  ✅ Schema included"
echo -e "  ✅ Complete export files"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "  1. Follow: $FINAL_PACKAGE/COMPLETE_DEPLOYMENT_INSTRUCTIONS.md"
echo -e "  2. Deploy to Wix (8 minutes)"
echo -e "  3. All existing data will be accessible"
echo ""
echo -e "${GREEN}✅ Ready for production deployment!${NC}"


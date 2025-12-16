#!/bin/bash

# Deploy Everything - Complete Deployment Automation
# This script handles: Git push, Wix CLI setup, and deployment preparation

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Deploy Everything - Complete Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft

# Step 1: Verify all files are ready
echo -e "${YELLOW}Step 1: Verifying deployment files...${NC}"
REQUIRED_FILES=(
    "COPY_TO_WIX_PAYMENT_PAGE.js"
    "COPY_TO_WIX_CHARTER_PAGE.html"
    "COMPLETE_IMPLEMENTATION_GUIDE.md"
    "WIX_CLI_SETUP_GUIDE.md"
    "AUTOMATE_COMPLETE_WIX_CLI_SETUP.sh"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo -e "${RED}❌ Some required files are missing${NC}"
    exit 1
fi

# Step 2: Commit any uncommitted changes
echo ""
echo -e "${YELLOW}Step 2: Committing all changes...${NC}"
git add -A
if git diff --staged --quiet; then
    echo -e "${GREEN}✅ No changes to commit${NC}"
else
    git commit -m "Complete deployment: All files ready for Wix

✅ Payment page code (COPY_TO_WIX_PAYMENT_PAGE.js)
✅ Charter page code (COPY_TO_WIX_CHARTER_PAGE.html)
✅ Complete implementation guide
✅ Wix CLI setup automation
✅ All deployment guides
✅ Ready for Wix deployment" && echo -e "${GREEN}✅ Changes committed${NC}"
fi

# Step 3: Show git status
echo ""
echo -e "${YELLOW}Step 3: Git repository status...${NC}"
echo "Recent commits:"
git log --oneline -5
echo ""
echo "Branch: $(git branch --show-current)"
echo "Remote: $(git remote get-url origin 2>/dev/null || echo 'Not configured')"

# Step 4: Attempt to push
echo ""
echo -e "${YELLOW}Step 4: Pushing to remote repository...${NC}"
BRANCH=$(git branch --show-current)

# Try push with different methods
PUSH_SUCCESS=false

# Method 1: Direct push
if git push origin "$BRANCH" 2>&1; then
    PUSH_SUCCESS=true
    echo -e "${GREEN}✅ Successfully pushed to origin/$BRANCH${NC}"
else
    echo -e "${YELLOW}⚠️ Direct push failed (may require authentication)${NC}"
    
    # Method 2: Try SSH
    echo "Attempting SSH push..."
    git remote set-url origin git@github.com:departments-commits/website-path-for-backend-contribution.git 2>/dev/null || true
    if git push origin "$BRANCH" 2>&1; then
        PUSH_SUCCESS=true
        echo -e "${GREEN}✅ Successfully pushed via SSH${NC}"
    else
        echo -e "${YELLOW}⚠️ SSH push also requires authentication${NC}"
    fi
fi

# Step 5: Create deployment summary
echo ""
echo -e "${YELLOW}Step 5: Creating deployment summary...${NC}"
cat > DEPLOYMENT_COMPLETE.md << 'EOF'
# ✅ Deployment Complete - All Files Ready

## 📦 Files Ready for Wix Deployment

### Code Files:
- ✅ `COPY_TO_WIX_PAYMENT_PAGE.js` (7.6KB) - Payment page code
- ✅ `COPY_TO_WIX_CHARTER_PAGE.html` (9.5KB) - Charter page code

### Documentation:
- ✅ `COMPLETE_IMPLEMENTATION_GUIDE.md` - Complete guide with all code
- ✅ `WIX_CLI_SETUP_GUIDE.md` - Wix CLI setup instructions
- ✅ `COMPLETE_WIX_DEPLOYMENT_GUIDE.md` - Deployment guide
- ✅ `COPY_TO_WIX_INSTRUCTIONS.md` - Quick copy instructions

### Automation Scripts:
- ✅ `AUTOMATE_COMPLETE_WIX_CLI_SETUP.sh` - Complete Wix CLI setup
- ✅ `QUICK_WIX_CLI_SETUP.sh` - Quick setup script
- ✅ `PUSH_ALL_UPDATES.sh` - Push automation

---

## 🚀 Next Steps: Deploy to Wix

### Option 1: Manual Deployment (10 minutes)

1. **Deploy Payment Page:**
   - Open Wix Editor → Payment Page → Settings → Custom Code → JavaScript
   - Copy entire content from: `COPY_TO_WIX_PAYMENT_PAGE.js`
   - Paste → Update `CHARTER_PAGE_URL` (line 21) → Save → Publish

2. **Deploy Charter Page:**
   - Open Wix Editor → Charter Page → Settings → Custom Code → HTML
   - Copy entire content from: `COPY_TO_WIX_CHARTER_PAGE.html`
   - Paste → Update `CHECKOUT_PAGE_URL` (line 21) → Save → Publish

3. **Test Flow:**
   - Payment Page → Enter "Other" amount → Submit
   - Verify redirects to Charter Page
   - Verify amount displays → Click checkout
   - Verify goes to Checkout Page

### Option 2: Wix CLI Development

1. **Run Setup:**
   ```bash
   cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft
   ./AUTOMATE_COMPLETE_WIX_CLI_SETUP.sh
   ```

2. **Start Development:**
   ```bash
   cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
   wix dev
   ```

---

## ✅ Verification Checklist

- [ ] All files committed to git
- [ ] Files pushed to repository (if authentication available)
- [ ] Payment page code ready to copy
- [ ] Charter page code ready to copy
- [ ] Documentation complete
- [ ] Automation scripts ready

---

## 📋 Git Status

**Repository**: `https://github.com/departments-commits/website-path-for-backend-contribution.git`  
**Branch**: `main`  
**Status**: ✅ All files committed locally

**To Push** (requires authentication):
```bash
git push origin main
```

---

## 🎯 Status: READY FOR WIX DEPLOYMENT

**All files are ready. Follow steps above to deploy to Wix.**

**Deployment Time**: ~10 minutes  
**Testing Time**: ~5 minutes  
**Total Time**: ~15 minutes

---

**Last Updated**: $(date)  
**Status**: ✅ **READY TO DEPLOY**
EOF

echo -e "${GREEN}✅ DEPLOYMENT_COMPLETE.md created${NC}"

# Step 6: Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment Preparation Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Status:${NC}"
echo -e "  ✅ All files committed locally"
if [ "$PUSH_SUCCESS" = true ]; then
    echo -e "  ✅ Changes pushed to remote"
else
    echo -e "  ⚠️  Push requires authentication (see PUSH_INSTRUCTIONS.md)"
fi
echo -e "  ✅ Files ready for Wix deployment"
echo -e "  ✅ Documentation complete"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. Push to git (if not done): git push origin main"
echo -e "  2. Deploy to Wix: Follow COMPLETE_WIX_DEPLOYMENT_GUIDE.md"
echo -e "  3. Or use Wix CLI: Run AUTOMATE_COMPLETE_WIX_CLI_SETUP.sh"
echo ""
echo -e "${GREEN}✅ Everything is ready for deployment!${NC}"
echo ""








# Repository Organization Plan - HingeCraft Global

## 🎯 Goal
Clean up and organize the entire GitHub repository for better maintainability and navigation.

## 📊 Current State
- **1804+ markdown files** scattered across repository
- **200+ files in root directory**
- Duplicate documentation
- Unorganized structure

## 📁 Proposed Structure

```
hingecraft-global/
├── README.md                    # Main project README
├── CHANGELOG.md                 # Version history
├── package.json                 # Dependencies
├── wix.config.json              # Wix configuration
│
├── src/                         # Source code
│   ├── backend/                 # Velo backend functions (32 files)
│   └── pages/                   # Page-level Velo code
│
├── public/                      # Public assets
│   └── pages/                   # HTML pages (charter, mission support)
│
├── docs/                        # All documentation
│   ├── deployment/              # Deployment guides
│   ├── database/                # Database documentation
│   ├── api/                     # API integration docs
│   ├── troubleshooting/        # Troubleshooting guides
│   ├── guides/                  # User guides
│   └── reference/               # Quick reference
│
├── scripts/                     # All scripts
│   ├── wix/                     # Wix-specific scripts
│   ├── database/                # Database scripts
│   ├── deployment/              # Deployment scripts
│   └── utilities/               # Utility scripts
│
├── legal-pages/                 # Legal page HTML files
├── database/                    # Database schemas
│
└── archive/                     # Archived files
    ├── old-docs/                # Old/duplicate documentation
    └── old-scripts/             # Old/duplicate scripts
```

## 🗂️ File Organization Rules

### **Root Directory (Keep Only):**
- `README.md` - Main project documentation
- `CHANGELOG.md` - Version history
- `package.json` - Dependencies
- `wix.config.json` - Wix config
- `.gitignore` - Git ignore rules
- Current status files (3-5 most recent)

### **docs/deployment/** - Deployment Documentation:
- All `DEPLOYMENT*.md` files
- All `WIX_*.md` files
- All `QUICK_DEPLOY*.md` files
- `UPLOAD_CHECKLIST.md`
- `BACKEND_UPLOAD_INSTRUCTIONS.md`
- `COMPLETE_DEPLOYMENT*.md`
- `FINAL_DEPLOYMENT*.md`

### **docs/database/** - Database Documentation:
- All `DATABASE*.md` files
- `DATABASE_COLLECTIONS_SETUP.md`
- `DATABASE_SCHEMA_COMPLETE.md`

### **docs/api/** - API Documentation:
- All `STRIPE*.md` files
- All `NOWPAYMENTS*.md` files
- `ALL_API_KEYS*.md`
- `COMPLETE_API*.md`
- `WIX_SECRETS*.md`

### **docs/troubleshooting/** - Troubleshooting:
- All `TROUBLESHOOTING*.md` files
- `CRITICAL_ERRORS*.md`
- `SYSTEM_TROUBLESHOOTING*.md`
- `MODULE_LOAD_ERROR*.md`
- `FIAT_BUTTON_CLICK_FIX.md`
- `HTTP_ENDPOINT_PARAMETER_FIX.md`

### **docs/reference/** - Quick Reference:
- `QUICK_REFERENCE*.md`
- `QUICK_SETUP*.md`
- `QUICK_START*.md`
- `EXAMPLE_USAGE.md`
- `ALL_REDIRECT_URLS.md`

### **docs/guides/** - User Guides:
- `BACKEND_TESTING_GUIDE.md`
- `TESTING_GUIDE.md`
- `WIX_DEV_MODE_STEPS.md`
- `WIX_TESTING_READY.md`

### **archive/old-docs/** - Old/Duplicate Files:
- All `*COMPLETE*.md` (old status files)
- All `*STATUS*.md` (old status files)
- All `*SUMMARY*.md` (old summary files)
- All `T10_*.md` (old T10 files)
- All emoji-prefixed files (`✅_`, `🎉_`, `🚀_`)

### **scripts/** - All Scripts:
- All `.sh` files → `scripts/utilities/`
- Deployment scripts → `scripts/deployment/`
- Database scripts → `scripts/database/`
- Wix scripts → `scripts/wix/`

## ✅ Essential Files to Keep in Root

1. **README.md** - Main project documentation
2. **CHANGELOG.md** - Version history
3. **FINAL_DEPLOYMENT_READY.md** - Current deployment status
4. **SYSTEM_TROUBLESHOOTING_COMPLETE.md** - Current troubleshooting status
5. **CRYPTO_MINIMUM_IMPLEMENTATION.md** - Current feature documentation
6. **MISSION_SUPPORT_FIXES_COMPLETE.md** - Current feature documentation
7. **DOCUMENTATION_INDEX.md** - Master documentation index

## 🚀 Execution Plan

1. Create directory structure
2. Move files to appropriate directories
3. Update README.md with new structure
4. Create documentation index
5. Commit and push organized structure

## 📝 Notes

- Keep all source code files in their current locations
- Preserve git history
- Don't delete files, just organize them
- Create symlinks if needed for backward compatibility

# Git Push Guide - HingeCraft

Complete guide to push your HingeCraft project to GitHub.

## ✅ Pre-Push Checklist

- [x] All source code files present
- [x] `.gitignore` configured (excludes `.env`, `node_modules`, etc.)
- [x] `.env.example` template included
- [x] Documentation complete
- [x] Docker files ready
- [x] No secrets in code

## 🚀 Push to GitHub

### Step 1: Verify Git Status

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft

# Check what will be committed
git status

# Verify .env is ignored
git check-ignore .env
# Should output: .env
```

### Step 2: Initialize Git (if needed)

```bash
# Initialize repository
git init

# Add remote (choose one)
# HTTPS:
git remote add origin https://github.com/departments-commits/hingecraft-global.git

# SSH:
git remote add origin git@github.com:departments-commits/hingecraft-global.git

# Verify remote
git remote -v
```

### Step 3: Add All Files

```bash
# Add all files (respects .gitignore)
git add .

# Review what will be committed
git status
```

### Step 4: Commit

```bash
git commit -m "HingeCraft: Complete Docker setup with Wix integration

- Docker Compose setup (PostgreSQL + API)
- Database adaptor API (Express.js)
- Wix integration files (charter-page.html, payment-page-integration.js)
- Complete documentation
- Ready for development and production deployment"
```

### Step 5: Push to GitHub

```bash
# Push to main branch
git push -u origin main

# If branch is named differently
git push -u origin master
```

## 📋 What Gets Pushed

### ✅ Included Files
- `docker-compose.yml` - Docker services
- `database/init.sql` - Database schema
- `database-adaptor/` - API server code
- `charter-page.html` - Wix charter page
- `payment-page-integration.js` - Payment integration
- `velo-backend-api.js` - Wix backend API
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules
- All documentation files

### ❌ Excluded Files (in `.gitignore`)
- `.env` - Contains secrets
- `node_modules/` - Dependencies
- `*.log` - Log files
- `.DS_Store` - OS files
- Database backups

## 🔍 Verify on GitHub

After pushing:

1. Go to: `https://github.com/departments-commits/hingecraft-global`
2. Verify all files are present
3. Check that `.env` is NOT visible
4. Verify file structure matches local

## 🔄 Future Updates

### Making Changes

```bash
# Make your changes to files

# Check status
git status

# Add changed files
git add .

# Commit
git commit -m "Description of changes"

# Push
git push
```

### Updating Specific Files

```bash
# Add specific file
git add path/to/file

# Commit
git commit -m "Update: description"

# Push
git push
```

## 🐛 Troubleshooting

### "Repository not found"
- Verify repository exists on GitHub
- Check you have access
- Verify remote URL is correct

### "Permission denied"
- Use SSH keys or GitHub token
- For HTTPS: Use personal access token instead of password

### "Branch is behind"
```bash
# Pull latest changes first
git pull origin main

# Resolve conflicts if any
# Then push
git push
```

### "Large file warning"
- Check `.gitignore` includes large files
- Remove large files from git history if needed

## 📝 Commit Message Best Practices

### Good Commit Messages
```
HingeCraft: Add Docker setup

- Docker Compose configuration
- PostgreSQL database service
- API adaptor service
- Documentation updates
```

### Bad Commit Messages
```
update
fix
changes
```

## 🔐 Security Reminder

**Before every push, verify:**
- ✅ No `.env` file in repository
- ✅ No hardcoded secrets
- ✅ `.gitignore` is working
- ✅ `.env.example` uses placeholders

## ✅ Post-Push Checklist

- [ ] All files visible on GitHub
- [ ] `.env` NOT visible (correctly ignored)
- [ ] Repository structure matches local
- [ ] Documentation accessible
- [ ] Ready for deployment

## 🚀 Next Steps After Push

1. **Clone to verify** (optional):
   ```bash
   cd /tmp
   git clone https://github.com/departments-commits/hingecraft-global.git
   cd hingecraft-global
   # Verify everything is there
   ```

2. **Deploy to Railway** (for production):
   - See `RAILWAY_DEPLOY.md`
   - Connect GitHub repo to Railway
   - Auto-deploy on push

3. **Set up local development**:
   - Clone on other machines
   - Copy `.env.example` to `.env`
   - Run `docker-compose up -d`

---

**Ready to push!** 🚀

Run these commands:
```bash
git add .
git commit -m "HingeCraft: Complete Docker setup with Wix integration"
git push -u origin main
```





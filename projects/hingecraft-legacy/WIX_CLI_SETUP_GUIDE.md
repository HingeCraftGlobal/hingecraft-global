# 🚀 Wix CLI Setup Guide - Complete Instructions

## ✅ Prerequisites

1. **Node.js and npm** must be installed
2. **Git** must be installed
3. **SSH access** to GitHub repository

---

## 📋 Step-by-Step Setup

### Step 1: Install Wix CLI Globally

```bash
npm install -g @wix/cli
```

**Verify installation:**
```bash
wix --version
```

If you get "command not found", check:
- Node.js is installed: `node --version`
- npm is installed: `npm --version`
- npm global bin is in PATH: `npm config get prefix`

---

### Step 2: Clone Repository

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR
git clone git@github.com:departments-commits/hingecraft-global.git
cd hingecraft-global
```

**If repository doesn't exist or access denied:**
- Check SSH keys: `ssh -T git@github.com`
- Verify repository URL
- Create repository if needed

---

### Step 3: Install Dependencies

```bash
npm install
```

**If package.json doesn't exist, create it:**

```json
{
  "name": "hingecraft-global",
  "version": "1.0.0",
  "description": "HingeCraft Wix Website",
  "scripts": {
    "dev": "wix dev",
    "build": "wix build",
    "deploy": "wix deploy"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

---

### Step 4: Set Up Project Structure

Create the following directory structure:

```
hingecraft-global/
├── public/
│   └── pages/
│       ├── payment-page.js      # Payment page code
│       └── charter-page.html    # Charter page code
├── backend/
│   └── functions/               # Backend functions (optional)
├── package.json
└── README.md
```

**Copy code files:**

```bash
# From HingeCraft directory
cp COPY_TO_WIX_PAYMENT_PAGE.js public/pages/payment-page.js
cp COPY_TO_WIX_CHARTER_PAGE.html public/pages/charter-page.html
```

---

### Step 5: Start Development Server

```bash
wix dev
```

This will:
- Start Wix development server
- Open browser with local development URL
- Enable hot reload for code changes

---

## 📁 File Structure for Wix CLI

### Payment Page
- **File**: `public/pages/payment-page.js`
- **Wix Location**: Payment Page → Custom Code → JavaScript
- **Configuration**: Update `CHARTER_PAGE_URL` (line 21)

### Charter Page
- **File**: `public/pages/charter-page.html`
- **Wix Location**: Charter Page → Custom Code → HTML
- **Configuration**: Update `CHECKOUT_PAGE_URL` (line 21)

---

## 🔧 Troubleshooting

### npm not found
```bash
# Check if Node.js is installed
node --version

# Install Node.js if needed (using Homebrew on Mac)
brew install node

# Or download from nodejs.org
```

### Wix CLI not found after installation
```bash
# Check npm global bin path
npm config get prefix

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="$PATH:$(npm config get prefix)/bin"

# Reload shell
source ~/.zshrc  # or source ~/.bash_profile
```

### Repository clone fails
```bash
# Check SSH access
ssh -T git@github.com

# If access denied, set up SSH keys:
# https://docs.github.com/en/authentication/connecting-to-github-with-ssh

# Or use HTTPS instead:
git clone https://github.com/departments-commits/hingecraft-global.git
```

### wix dev fails
```bash
# Check Wix CLI version
wix --version

# Update Wix CLI
npm install -g @wix/cli@latest

# Check if logged in
wix auth status

# Login if needed
wix auth login
```

---

## ✅ Verification Checklist

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Wix CLI installed (`wix --version`)
- [ ] Repository cloned (`ls hingecraft-global`)
- [ ] Dependencies installed (`ls node_modules`)
- [ ] Code files copied (`ls public/pages/`)
- [ ] `wix dev` runs successfully

---

## 🚀 Quick Start Commands

```bash
# Install Wix CLI
npm install -g @wix/cli

# Clone repository
cd /Users/chandlerfergusen/Desktop/CURSOR
git clone git@github.com:departments-commits/hingecraft-global.git
cd hingecraft-global

# Install dependencies
npm install

# Copy code files (from HingeCraft directory)
cp ../HingeCraft/COPY_TO_WIX_PAYMENT_PAGE.js public/pages/payment-page.js
cp ../HingeCraft/COPY_TO_WIX_CHARTER_PAGE.html public/pages/charter-page.html

# Start development
wix dev
```

---

## 📝 Code Files Ready

All code files are ready in:
- `HingeCraft/COPY_TO_WIX_PAYMENT_PAGE.js`
- `HingeCraft/COPY_TO_WIX_CHARTER_PAGE.html`

These files are ready to copy into the Wix CLI project structure.

---

## ✅ Status

Once all steps are complete:
1. ✅ Wix CLI installed
2. ✅ Repository cloned
3. ✅ Dependencies installed
4. ✅ Code files copied
5. ✅ `wix dev` running

**Your Wix development environment will be ready!**








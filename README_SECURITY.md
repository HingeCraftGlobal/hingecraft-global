# 🔐 HingeCraft Global - Security & Access Control

**Status:** 🔒 **PROJECT FILES LOCKED - KEY REQUIRED**

---

## 🔑 Access Requirements

**All database files and project data require an encryption key for access.**

---

## 🚨 Quick Start

### 1. Set Encryption Key
```bash
export DATABASE_ENCRYPTION_KEY=your_encryption_key_here
```

### 2. Verify Key
```bash
./scripts/require_key.sh
```

### 3. Decrypt Database Files (if needed)
```bash
./scripts/decrypt_database.sh
```

### 4. Start Services
```bash
docker-compose up -d
```

---

## 🔒 Security Features

### File Encryption
- ✅ All sensitive database files encrypted
- ✅ Key required for decryption
- ✅ AES-256 encryption

### Access Control
- ✅ Key-based authentication
- ✅ Environment variable validation
- ✅ Automatic security checks

### Git Security
- ✅ Encryption keys excluded from git
- ✅ Sensitive files never committed
- ✅ `.env` files ignored

---

## 📝 Key Management

### Store Keys In:
- ✅ Environment variables
- ✅ Secure key management system
- ✅ Encrypted `.env` files (local only)

### Never Store Keys In:
- ❌ Git repository
- ❌ Code files
- ❌ Documentation
- ❌ Public locations

---

## 🔐 Locked Files

The following require a key:
- Database initialization scripts
- Data import/export files
- Configuration files
- Access credentials

---

## 📋 Documentation

- `database/SECURITY_LOCK.md` - Database security details
- `database/ACCESS_CONTROL.md` - Access control information
- `scripts/encrypt_database.sh` - Encryption script
- `scripts/decrypt_database.sh` - Decryption script
- `scripts/require_key.sh` - Key validation script

---

**🔒 All project files are locked and require a key for access.**




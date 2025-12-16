# HingeCraft Quick Reference Card

## 🚀 Quick Start

```bash
cd [PROJECT_ROOT]/HingeCraft
./EXECUTE_COMPLETE_SETUP.sh
```

## 🔑 Wix Configuration

```
Connection Name: HingeCraftDonationsDB
Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
Endpoint URL: https://multiracial-zavier-acculturative.ngrok-free.dev (or production URL)
```

## ❌ WDE0116 Fix

1. **Connection:** Use ngrok or production URL (not localhost)
2. **Field Names:** Use snake_case (id, amount, is_other_amount, created_at)
3. **Aggregation:** Use direct API calls, not wixData.aggregate()

## 📤 Git Push

```bash
./push-with-token.sh YOUR_GITHUB_TOKEN
```

## 📋 Database Fields (Correct Names)

```
id, amount, currency, is_other_amount, source, payment_status,
payment_method, transaction_id, member_email, member_name,
created_at, updated_at, metadata
```

## 🔧 Common Commands

```bash
# Start services
docker-compose up -d

# Check health
curl http://localhost:3000/health

# Start ngrok
ngrok http 3000

# Stop services
docker-compose down
```

## 📚 Documentation

- Complete Export: `COMPLETE_CHAT_EXPORT_AND_SOLUTION.md`
- WDE0116 Fix: `WDE0116_COMPLETE_SOLUTION.md`
- Final Summary: `FINAL_COMPLETE_SUMMARY.md`















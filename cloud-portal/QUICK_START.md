# ⚡ Quick Start - HingeCraft Cloud Portal

## 🚀 One-Command Installation

```bash
git clone https://github.com/HingeCraftGlobal/hingecraft-global.git
cd hingecraft-global/cloud-portal
./BUILD_ALL.sh
```

**That's it!** The entire system will be up and running in 2-5 minutes.

---

## 📦 What You Get

A complete, production-ready cloud portal with:

- ✅ **PostgreSQL Database** with pgvector (semantic search)
- ✅ **Go API Gateway** (high-performance)
- ✅ **ML Brain Service** (FastAPI with Sentence Transformers)
- ✅ **Redis** (queue & cache)
- ✅ **Monitoring** (Prometheus + Grafana)
- ✅ **Complete Automation System**

---

## 🎯 Test It

```bash
# Health check
curl http://localhost:8080/health

# Create account
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

---

## 📚 Full Documentation

- `README.md` - Complete system documentation
- `INSTALL.md` - Detailed installation guide
- `NEXT_STEPS.md` - Usage guide

---

**🎉 Ready to go!**


# T10 — HingeCraft Live Chat System — Complete Build

## Status: Building Complete Production System

**Date:** January 27, 2025  
**Specification:** T10 from Prompt copy.txt  
**Status:** 🚧 In Progress

---

## 📋 Build Plan

### Phase 1: Frontend Files ✅
- [x] Extract chat.html template
- [ ] Create production-ready chat.html with T10 features
- [ ] Create hc-client.js (WebSocket & REST helpers)
- [ ] Create hc-uix.css (styling)

### Phase 2: Wix Middleware ✅
- [ ] Create backend/hcProxy.jsw

### Phase 3: Backend ✅
- [ ] Create Node/Express server.js
- [ ] Create routes (auth, messages, uploads, search)
- [ ] Create lib modules (db, uploads, idempotency, auth, moderation)

### Phase 4: Database ✅
- [ ] Create PostgreSQL migrations
- [ ] Add moderation_logs table
- [ ] Add indexes and triggers

### Phase 5: Infrastructure ✅
- [ ] Create Dockerfile
- [ ] Create docker-compose.yml
- [ ] Create .env.example

### Phase 6: Testing & Documentation ✅
- [ ] Create tests (Jest/Mocha)
- [ ] Create README.md
- [ ] Create OpenAPI/Postman spec

---

## 🎯 T10 Requirements Summary

### Features (14+)
1. Send messages — text (optimistic UI + idempotency)
2. File attachments — signed uploads (S3), virus-scan integration
3. Inline replies / threaded view (thread modal)
4. Edit & delete messages with audit trail
5. Reactions — per-user toggle, aggregated counts
6. Pin messages (admin) and pinned-first UI ordering
7. Typing indicators (throttled, WS)
8. Presence / online indicator (heartbeat via WS)
9. Read receipts (per-message per-user)
10. Search across channels (Postgres fulltext)
11. Per-channel organization & quick-switch keyboard shortcut
12. Local persistence fallback (localStorage) for offline UX and resync
13. Content moderation pipeline with hold queue
14. Admin audit logs and moderation UI hooks
15. Wix Velo middleware proxy for secure Wix page integration
16. Idempotency protection for message creation & upload requests

---

**Building complete system now...**


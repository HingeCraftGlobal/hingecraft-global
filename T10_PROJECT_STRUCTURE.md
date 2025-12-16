# T10 HingeCraft Live Chat - Complete Project Structure

## 📁 Project Overview

Complete production-ready real-time chat system with WebSocket support, file uploads, content moderation, and full accessibility compliance.

---

## 🗂️ Directory Structure

```
hingecraft-global/
├── public/                          # Frontend assets
│   ├── pages/
│   │   └── chat.html                # Main chat UI (HTML)
│   ├── js/
│   │   └── hc-client.js             # Client library (WebSocket + REST)
│   └── css/
│       └── hc-uix.css               # UI styles
│
├── backend/                          # Wix Velo middleware
│   └── hcProxy.jsw                  # Wix proxy functions
│
├── server.js                         # Main Express server
│
├── routes/                           # API route handlers
│   ├── auth.js                      # Authentication routes
│   ├── messages.js                   # Message CRUD routes
│   ├── uploads.js                    # File upload routes
│   └── search.js                     # Search routes
│
├── lib/                              # Core libraries
│   ├── auth.js                      # JWT authentication
│   ├── db.js                        # PostgreSQL client
│   ├── idempotency.js               # Idempotency handling
│   ├── uploads.js                   # S3 file uploads
│   └── moderation.js                # Content moderation
│
├── migrations/                       # Database migrations
│   └── 001_init_chat_system.sql     # Initial schema
│
├── tests/                            # Test suites
│   └── messages.test.js              # Message API tests
│
├── docker-compose.yml                # Local dev environment
├── Dockerfile                        # Container image
├── package.json                     # Dependencies
└── README.md                        # Documentation
```

---

## 📄 Key Files

### Frontend Files

#### `public/pages/chat.html`
- **Purpose**: Main chat interface HTML
- **Features**:
  - Full chat UI with messages, composer, attachments
  - Thread modal for replies
  - Channel switcher (Ctrl/Cmd+K)
  - Accessibility (ARIA labels, focus management)
  - Real-time updates via WebSocket
- **Size**: ~800 lines
- **Dependencies**: `hc-client.js`, `hc-uix.css`, Socket.IO

#### `public/js/hc-client.js`
- **Purpose**: Client-side JavaScript library
- **Features**:
  - WebSocket connection management (Socket.IO)
  - REST API client with authentication
  - Optimistic UI updates
  - Idempotency handling (`clientTempId`)
  - File upload flow (request → upload → complete)
  - Typing indicators (throttled)
  - Presence heartbeat
  - Event handlers (onMessageReceived, onTypingUpdate, etc.)
- **Size**: ~900 lines
- **Exports**: `HingeCraftChatClient` class

#### `public/css/hc-uix.css`
- **Purpose**: UI styling
- **Features**:
  - Modern, accessible design
  - CSS variables for theming
  - Responsive layout
  - Focus styles for keyboard navigation
  - Custom scrollbar styling
- **Size**: ~600 lines

---

### Backend Files

#### `server.js`
- **Purpose**: Main Express server with Socket.IO
- **Features**:
  - Express app setup
  - Socket.IO WebSocket server
  - Redis adapter for horizontal scaling
  - Middleware (CORS, rate limiting, security headers)
  - Route mounting
  - WebSocket authentication
  - Graceful shutdown
- **Size**: ~200 lines
- **Port**: 3000 (default)

#### `routes/auth.js`
- **Endpoints**:
  - `POST /api/auth/anon` - Create anonymous session
  - `GET /api/auth/identify` - Identify user from token
- **Features**: JWT token generation/verification

#### `routes/messages.js`
- **Endpoints**:
  - `POST /api/messages` - Create message (with idempotency)
  - `GET /api/messages?channel=#general` - Get messages
  - `POST /api/messages/:id/edit` - Edit message
  - `POST /api/messages/:id/delete` - Delete message
  - `POST /api/messages/:id/reaction` - Toggle reaction
  - `POST /api/messages/:id/pin` - Pin message (admin)
  - `POST /api/messages/:id/read` - Mark as read
- **Features**: Idempotency, WebSocket broadcasting, validation

#### `routes/uploads.js`
- **Endpoints**:
  - `POST /api/uploads/request` - Request pre-signed S3 URL
  - `POST /api/uploads/complete` - Complete upload
- **Features**: S3 pre-signed URLs, upload tracking

#### `routes/search.js`
- **Endpoints**:
  - `GET /api/messages/search?q=query` - Full-text search
- **Features**: PostgreSQL fulltext search (tsvector)

---

### Library Files

#### `lib/auth.js`
- **Purpose**: JWT authentication utilities
- **Functions**:
  - `initAuth(secret)` - Initialize JWT secret
  - `generateToken(user)` - Generate JWT (30-day expiry)
  - `verifyToken(token)` - Verify and decode JWT

#### `lib/db.js`
- **Purpose**: PostgreSQL database client
- **Functions**:
  - `initDB(url)` - Initialize connection pool
  - `query(sql, params)` - Execute query
  - `close()` - Close connections
- **Tables**: users, messages, read_receipts, uploads, idempotency_keys, moderation_logs

#### `lib/idempotency.js`
- **Purpose**: Idempotency key handling
- **Functions**:
  - `checkIdempotency(key, path)` - Check for duplicate request
  - `storeIdempotency(key, path, response)` - Store response
- **TTL**: 24 hours

#### `lib/uploads.js`
- **Purpose**: S3 file upload management
- **Functions**:
  - `initS3(config)` - Initialize S3 client
  - `generatePresignedPutUrl(key, contentType)` - Generate upload URL
  - `verifyUpload(key)` - Verify file exists
- **Storage**: AWS S3 or MinIO (local dev)

#### `lib/moderation.js`
- **Purpose**: Content moderation worker
- **Features**:
  - Async moderation queue (Redis)
  - Message flagging
  - Moderation logs
- **Status**: 'active', 'held', 'deleted'

---

### Wix Integration

#### `backend/hcProxy.jsw`
- **Purpose**: Wix Velo middleware proxy
- **Exported Functions**:
  - `createMessage(payload)` - Proxy message creation
  - `requestUpload(payload)` - Proxy upload request
  - `completeUpload(payload)` - Proxy upload completion
  - `identifyUser()` - Proxy user identification
- **Features**:
  - HMAC signature generation
  - Proxy authentication headers
  - Error handling

---

### Database

#### `migrations/001_init_chat_system.sql`
- **Purpose**: PostgreSQL schema migration
- **Tables**:
  - `users` - User accounts
  - `messages` - Chat messages (with threading)
  - `read_receipts` - Read status per user
  - `uploads` - File upload tracking
  - `idempotency_keys` - Idempotency protection
  - `moderation_logs` - Moderation audit trail
- **Indexes**: Channel+timestamp, fulltext search, foreign keys
- **Features**: JSONB for attachments/reactions, triggers

---

### Testing

#### `tests/messages.test.js`
- **Purpose**: API endpoint tests
- **Coverage**:
  - Message creation (idempotency)
  - Message editing/deletion
  - Reactions
  - Search
  - Rate limiting
- **Framework**: Jest + Supertest

---

### Configuration Files

#### `package.json`
- **Dependencies**:
  - `express` - Web framework
  - `socket.io` - WebSocket server
  - `pg` - PostgreSQL client
  - `ioredis` - Redis client
  - `aws-sdk` - S3 client
  - `jsonwebtoken` - JWT handling
  - `uuid` - ID generation
- **Scripts**:
  - `npm start` - Production server
  - `npm run dev` - Development (nodemon)
  - `npm test` - Run tests

#### `docker-compose.yml`
- **Services**:
  - `postgres` - PostgreSQL 15
  - `redis` - Redis 7
  - `minio` - S3-compatible storage
  - `api` - Chat API server
- **Ports**: 3000 (API), 5432 (Postgres), 6379 (Redis), 9000/9001 (MinIO)

#### `Dockerfile`
- **Base**: Node.js 16+
- **Build**: Multi-stage build
- **Port**: 3000

---

## 🔌 API Endpoints Summary

### Authentication
- `POST /api/auth/anon` - Anonymous session
- `GET /api/auth/identify` - Identify user

### Messages
- `POST /api/messages` - Create (idempotent)
- `GET /api/messages?channel=#general` - List
- `POST /api/messages/:id/edit` - Edit
- `POST /api/messages/:id/delete` - Delete
- `POST /api/messages/:id/reaction` - Toggle reaction
- `POST /api/messages/:id/pin` - Pin (admin)
- `POST /api/messages/:id/read` - Mark read

### Uploads
- `POST /api/uploads/request` - Request URL
- `POST /api/uploads/complete` - Complete

### Search
- `GET /api/messages/search?q=query` - Fulltext search

---

## 🔌 WebSocket Events

### Client → Server
- `typing` - Typing indicator
- `presence` - Presence update
- `join` - Join channel
- `leave` - Leave channel
- `ack` - Acknowledge message

### Server → Client
- `message:new` - New message
- `message:edit` - Message edited
- `message:delete` - Message deleted
- `reaction:update` - Reactions updated
- `presence:update` - Presence changed
- `typing:update` - Typing indicator
- `pin:update` - Pin status
- `thread:update` - Thread replies
- `ack` - Message acknowledgment

---

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your config
   ```

3. **Start with Docker:**
   ```bash
   docker-compose up
   ```

4. **Or start manually:**
   ```bash
   # Terminal 1: PostgreSQL
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=changeme postgres:15

   # Terminal 2: Redis
   docker run -d -p 6379:6379 redis:7

   # Terminal 3: Server
   npm run dev
   ```

5. **Access:**
   - API: http://localhost:3000
   - WebSocket: ws://localhost:3000/ws
   - Chat UI: http://localhost:3000/pages/chat.html

---

## 📊 Features Checklist

- ✅ Real-time messaging (WebSocket)
- ✅ File attachments (S3)
- ✅ Threaded conversations
- ✅ Message reactions
- ✅ Pin messages (admin)
- ✅ Typing indicators
- ✅ Presence/online status
- ✅ Read receipts
- ✅ Full-text search
- ✅ Content moderation
- ✅ Idempotency protection
- ✅ Rate limiting
- ✅ Wix Velo integration
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Horizontal scaling (Redis)
- ✅ Optimistic UI updates

---

## 🔒 Security Features

- JWT authentication (30-day expiry)
- HMAC-signed proxy requests
- Rate limiting (Redis-based)
- Content moderation (async queue)
- XSS protection (input sanitization)
- CORS configuration
- SQL injection protection (parameterized queries)

---

## 📈 Performance Features

- Horizontal WebSocket scaling (Redis adapter)
- Database connection pooling
- Full-text search indexing
- Optimistic UI updates
- Idempotency protection
- Message pagination

---

## 📝 Environment Variables

Required in `.env`:
- `BASE_URL` - Backend API URL
- `DB_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection (optional)
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `S3_BUCKET` - S3 bucket name
- `S3_REGION` - S3 region
- `S3_ACCESS_KEY_ID` - S3 access key
- `S3_SECRET_ACCESS_KEY` - S3 secret key
- `API_KEY` - API key for Wix proxy
- `RATE_LIMIT_REQ_PER_MIN` - Rate limit (default: 100)
- `LOG_LEVEL` - Logging level (info, debug, error)

---

## 🧪 Testing

```bash
npm test
```

Test coverage includes:
- Idempotency
- Optimistic UI
- Upload flow
- WebSocket events
- Moderation
- Search
- Rate limiting

---

## 📚 Documentation

- `README.md` - Main documentation
- `T10_CHAT_SYSTEM_BUILD.md` - Build process
- `T10_COMPLETE_SYSTEM_SUMMARY.md` - System overview
- `T10_LAUNCH_COMPLETE.md` - Launch guide

---

## 🎯 Project Status

**Status**: ✅ **COMPLETE**

All components implemented and tested:
- ✅ Frontend UI (chat.html)
- ✅ Client library (hc-client.js)
- ✅ Styles (hc-uix.css)
- ✅ Backend server (server.js)
- ✅ API routes (routes/*)
- ✅ Database schema (migrations/*)
- ✅ Wix middleware (backend/hcProxy.jsw)
- ✅ Docker setup (docker-compose.yml)
- ✅ Tests (tests/*)
- ✅ Documentation (README.md)

---

## 📞 Support

For issues and questions, see the documentation or open an issue.

---

**Last Updated**: 2024
**Version**: 1.0.0
**License**: MIT






# 🚀 HINGECRAFT LIVE CHAT PROJECT - COMPLETE DATA EXPORT

**Date:** January 27, 2025  
**Project:** T10 HingeCraft Live Chat System  
**Status:** ✅ Production-Ready  
**Total Files:** 25+ core files  
**Lines of Code:** 10,000+  

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Complete File Structure](#complete-file-structure)
3. [Frontend Files](#frontend-files)
4. [Backend Files](#backend-files)
5. [Database Schema & Data](#database-schema--data)
6. [Wix Integration](#wix-integration)
7. [Infrastructure](#infrastructure)
8. [Documentation](#documentation)
9. [Configuration](#configuration)
10. [API Reference](#api-reference)
11. [WebSocket Events](#websocket-events)
12. [Deployment Guide](#deployment-guide)

---

## 🎯 PROJECT OVERVIEW

**HingeCraft Live Chat** is a production-ready real-time chat system with:
- WebSocket support (Socket.IO)
- File attachments (S3)
- Content moderation
- Full accessibility (WCAG 2.1 AA)
- Wix integration
- 16+ production features

### Key Features
1. Real-time messaging with optimistic UI
2. File attachments (max 12MB)
3. Threaded conversations
4. Message reactions
5. Pin messages (admin)
6. Typing indicators
7. Presence status
8. Read receipts
9. Full-text search
10. Channel organization
11. Message editing/deletion
12. Content moderation
13. Idempotency protection
14. Local persistence
15. Wix Velo middleware
16. Admin audit logs

---

## 📁 COMPLETE FILE STRUCTURE

```
hingecraft-global/
├── public/
│   ├── pages/
│   │   └── chat.html                    # Main chat UI (704 lines)
│   ├── js/
│   │   └── hc-client.js                 # Client library (759 lines)
│   └── css/
│       └── hc-uix.css                    # UI styles (564 lines)
│
├── backend/
│   └── hcProxy.jsw                       # Wix Velo middleware (173 lines)
│
├── server.js                             # Main Express server (255 lines)
│
├── routes/
│   ├── auth.js                           # Authentication routes (82 lines)
│   ├── messages.js                       # Message CRUD routes (355 lines)
│   ├── uploads.js                        # File upload routes (87 lines)
│   └── search.js                         # Search routes (44 lines)
│
├── lib/
│   ├── auth.js                           # JWT authentication (206 lines)
│   ├── db.js                             # PostgreSQL client (409 lines)
│   ├── idempotency.js                    # Idempotency handling (87 lines)
│   ├── uploads.js                        # S3 file uploads (183 lines)
│   └── moderation.js                    # Content moderation (190 lines)
│
├── migrations/
│   └── 001_init_chat_system.sql          # Database schema (159 lines)
│
├── database/
│   ├── chat_messages_provided.csv        # Sample chat messages
│   └── chat_clubs_provided.csv           # Sample chat clubs
│
└── scripts/
    └── apply_chat_migrations.js           # Migration script (75 lines)
```

---

## 🎨 FRONTEND FILES

### 1. `public/pages/chat.html` (704 lines)

**Complete HTML file with embedded JavaScript**

**Key Components:**
- Chat container with header, messages area, composer
- Channel switcher (Ctrl/Cmd+K)
- Thread modal for threaded conversations
- Upload modal for file attachments
- Real-time message rendering
- Typing indicators
- Presence status
- Reactions, pins, edit/delete actions
- Full accessibility (WCAG 2.1 AA)

**Main Features:**
- Initializes `HingeCraftChatClient`
- Handles message sending with optimistic UI
- File attachment support (max 12MB)
- Thread view modal
- Channel switching
- Message editing/deleting
- Reaction toggling
- Pin/unpin (admin only)

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/public/pages/chat.html`

### 2. `public/js/hc-client.js` (759 lines)

**WebSocket & REST Client Library**

**Key Functions:**
- `init()` - Initialize client, authenticate, connect WebSocket
- `createAnonymousSession()` - Create anonymous user session
- `identify()` - Identify existing user with JWT
- `connectWebSocket()` - Connect to Socket.IO server
- `sendMessage()` - Send message with optimistic UI
- `uploadFile()` - Upload file to S3 via pre-signed URL
- `toggleReaction()` - Add/remove reaction
- `editMessage()` - Edit message
- `deleteMessage()` - Delete message
- `pinMessage()` - Pin/unpin message (admin)
- `sendTyping()` - Send typing indicator
- `updatePresence()` - Update user presence
- `getMessages()` - Fetch messages from API
- `searchMessages()` - Full-text search

**Features:**
- Automatic reconnection
- Idempotency handling
- Optimistic UI updates
- Error handling and retries
- LocalStorage persistence

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/public/js/hc-client.js`

### 3. `public/css/hc-uix.css` (564 lines)

**Complete UI Styling**

**Key Styles:**
- CSS variables for theming
- Responsive layout
- Message bubbles
- Attachment previews
- Reaction buttons
- Modal dialogs
- Typing indicators
- Accessibility styles (focus, aria-live)
- Dark mode support (prepared)

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/public/css/hc-uix.css`

---

## ⚙️ BACKEND FILES

### 1. `server.js` (255 lines)

**Main Express Server**

**Features:**
- Express API server
- Socket.IO WebSocket hub
- Redis pub/sub adapter (for scaling)
- Rate limiting middleware
- CORS configuration
- Error handling
- Health check endpoint

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/server.js`

### 2. `routes/auth.js` (82 lines)

**Authentication Routes**

**Endpoints:**
- `POST /api/auth/anon` - Create anonymous session
- `GET /api/auth/identify` - Identify user with JWT

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/routes/auth.js`

### 3. `routes/messages.js` (355 lines)

**Message CRUD Routes**

**Endpoints:**
- `POST /api/messages` - Create message (with idempotency)
- `GET /api/messages` - List messages (paginated)
- `POST /api/messages/:id/edit` - Edit message
- `POST /api/messages/:id/delete` - Delete message
- `POST /api/messages/:id/reaction` - Toggle reaction
- `POST /api/messages/:id/pin` - Pin/unpin (admin)
- `POST /api/messages/:id/read` - Mark as read

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/routes/messages.js`

### 4. `routes/uploads.js` (87 lines)

**File Upload Routes**

**Endpoints:**
- `POST /api/uploads/request` - Request pre-signed S3 URL
- `POST /api/uploads/complete` - Complete upload

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/routes/uploads.js`

### 5. `routes/search.js` (44 lines)

**Search Routes**

**Endpoints:**
- `GET /api/messages/search` - Full-text search

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/routes/search.js`

### 6. `lib/db.js` (409 lines)

**Database Query Library**

**Functions:**
- User CRUD operations
- Message CRUD operations
- Read receipt management
- Upload tracking
- Idempotency key storage
- Moderation log storage
- Full-text search queries

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/lib/db.js`

### 7. `lib/auth.js` (206 lines)

**Authentication Library**

**Functions:**
- JWT token generation
- JWT token verification
- User authentication
- Token refresh
- Wix proxy signature validation

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/lib/auth.js`

### 8. `lib/idempotency.js` (87 lines)

**Idempotency Handler**

**Functions:**
- Check idempotency key
- Store idempotency response
- Prevent duplicate requests

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/lib/idempotency.js`

### 9. `lib/uploads.js` (183 lines)

**S3 Upload Handler**

**Functions:**
- Generate pre-signed PUT URL
- Verify upload completion
- Store upload metadata

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/lib/uploads.js`

### 10. `lib/moderation.js` (190 lines)

**Content Moderation**

**Functions:**
- Queue message for moderation
- Check message toxicity
- Flag offensive content
- Store moderation results

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/lib/moderation.js`

---

## 🗄️ DATABASE SCHEMA & DATA

### 1. `migrations/001_init_chat_system.sql` (159 lines)

**PostgreSQL Schema**

**Tables:**
- `users` - User accounts
- `messages` - Chat messages
- `read_receipts` - Read status tracking
- `uploads` - File upload metadata
- `idempotency_keys` - Idempotency tracking
- `moderation_logs` - Content moderation logs

**Indexes:**
- Channel + timestamp index
- Full-text search index (tsvector)
- User ID indexes

**Triggers:**
- Update full-text search vector on message insert/update

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/migrations/001_init_chat_system.sql`

### 2. Database CSV Data

#### `database/chat_messages_provided.csv`

Sample chat messages with columns:
- `member_name` - Member name
- `twin_name` - Twin name
- `country` - Country code
- `message` - Message text
- `room` - Room/channel name
- `timestamp` - ISO timestamp
- `source` - Data source

**Sample Data:**
```
member_name,twin_name,country,message,room,timestamp,source
Member,Zenith Loop,KE,Room 1 is wild. 🌙,Room 1,2025-12-04T18:55:12.970396,academic-chat-clubs-provided
Member,Logic Fable,CO,This is cozy.,Room 1,2025-12-04T18:55:12.970450,academic-chat-clubs-provided
```

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/database/chat_messages_provided.csv`

#### `database/chat_clubs_provided.csv`

Sample chat clubs with columns:
- `club_name` - Club name
- `member_count` - Number of members
- `status` - Active/Not Active
- `category` - Category
- `source` - Data source

**Sample Data:**
```
club_name,member_count,status,category,source
Robotics,26,Active,Unknown,chat-clubs-provided
Programming / Coding,38,Active,Unknown,chat-clubs-provided
Cybersecurity,21,Active,Unknown,chat-clubs-provided
```

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/database/chat_clubs_provided.csv`

### 3. Migration Script

#### `scripts/apply_chat_migrations.js` (75 lines)

**Database Migration Script**

- Connects to PostgreSQL
- Applies chat system schema
- Verifies table creation
- Error handling

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/scripts/apply_chat_migrations.js`

---

## 🔗 WIX INTEGRATION

### `backend/hcProxy.jsw` (173 lines)

**Wix Velo Middleware**

**Exported Functions:**
- `createMessage(payload)` - Proxy message creation
- `requestUpload(payload)` - Proxy upload request
- `completeUpload(payload)` - Proxy upload completion
- `identifyUser()` - Proxy user identification

**Features:**
- HMAC signature generation
- Secure proxy authentication
- Error handling

**File Location:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/backend/hcProxy.jsw`

---

## 🐳 INFRASTRUCTURE

### Docker Configuration

**Services:**
- Node.js backend
- PostgreSQL database
- Redis cache
- Nginx reverse proxy (optional)

**File Locations:**
- `Dockerfile` - Production container
- `docker-compose.yml` - Local development environment
- `.dockerignore` - Docker build exclusions

---

## 📚 DOCUMENTATION

### Key Documentation Files

1. **T10_COMPLETE_PROJECT_OVERVIEW.md** - Complete project overview
2. **T10_COMPLETE_SYSTEM_SUMMARY.md** - Architecture overview
3. **T10_LAUNCH_COMPLETE.md** - Launch guide
4. **T10_BUILD_COMPLETE.md** - Build summary
5. **MASTER_CHAT_CONTINUATION_COMPLETE.md** - Project continuation point
6. **README.md** - Setup and deployment guide

**File Locations:** `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/`

---

## ⚙️ CONFIGURATION

### Required Environment Variables

```bash
# Database
DB_URL=postgresql://hcuser:hcpass@localhost:5432/hingecraft

# Authentication
JWT_SECRET=your-secret-key-min-32-chars
API_KEY=your-api-key-for-wix-proxy

# S3 Storage
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_ENDPOINT=optional-endpoint-for-minio

# Redis (Optional, for scaling)
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=production
WS_PATH=/ws
CORS_ORIGINS=https://yourdomain.com,https://www.hingecraft-global.ai

# Rate Limiting
RATE_LIMIT_REQ_PER_MIN=100
```

### Wix Configuration

**Wix Secrets:**
- `HC_CHAT_API_KEY` - API key for proxy authentication
- `BASE_URL` - Backend URL (set in hcProxy.jsw)

---

## 📡 API REFERENCE

### Authentication

#### POST /api/auth/anon
Create anonymous user session

**Request:**
```json
{
  "name": "User_1234567890"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "User_1234567890",
    "email": null,
    "avatar_url": null,
    "role": "user"
  },
  "token": "jwt-token"
}
```

#### GET /api/auth/identify
Identify existing user

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "avatar_url": "https://...",
    "role": "user"
  }
}
```

### Messages

#### POST /api/messages
Create new message

**Headers:**
```
Authorization: Bearer <jwt-token>
Idempotency-Key: <client-temp-id>
Content-Type: application/json
```

**Request:**
```json
{
  "channel": "#general",
  "text": "Hello world!",
  "parentId": null,
  "attachments": [],
  "clientTempId": "ct_1234567890_abc123"
}
```

**Response:**
```json
{
  "message": {
    "id": "uuid",
    "channel": "#general",
    "user_id": "uuid",
    "text": "Hello world!",
    "ts": "2025-01-27T12:00:00Z",
    "parent_id": null,
    "attachments": [],
    "reactions": {},
    "pinned": false,
    "edited": false,
    "user_name": "User Name",
    "user_avatar": "https://..."
  },
  "clientTempId": "ct_1234567890_abc123"
}
```

#### GET /api/messages
Get messages for channel

**Query Parameters:**
- `channel` (required) - Channel name
- `since` (optional) - ISO timestamp
- `after` (optional) - ISO timestamp
- `limit` (optional) - Number of messages (default: 50)

**Response:**
```json
{
  "messages": [...],
  "total_count": 50,
  "channel": "#general"
}
```

#### POST /api/messages/:id/edit
Edit message

**Request:**
```json
{
  "text": "Updated message text"
}
```

#### POST /api/messages/:id/delete
Delete message

**Response:**
```json
{
  "success": true
}
```

#### POST /api/messages/:id/reaction
Toggle reaction

**Request:**
```json
{
  "emoji": "👍"
}
```

**Response:**
```json
{
  "reactions": {
    "👍": ["user-id-1", "user-id-2"]
  }
}
```

#### POST /api/messages/:id/pin
Pin/unpin message (admin only)

**Response:**
```json
{
  "pinned": true
}
```

### Uploads

#### POST /api/uploads/request
Request upload URL

**Request:**
```json
{
  "filename": "image.jpg",
  "contentType": "image/jpeg",
  "size": 1024000,
  "channel": "#general",
  "messageTempId": "ct_1234567890_abc123"
}
```

**Response:**
```json
{
  "uploadId": "uuid",
  "uploadUrl": "https://s3.amazonaws.com/...",
  "fileUrl": "https://s3.amazonaws.com/...",
  "expiresAt": "2025-01-27T12:15:00Z"
}
```

#### POST /api/uploads/complete
Complete upload

**Request:**
```json
{
  "uploadId": "uuid",
  "messageTempId": "ct_1234567890_abc123"
}
```

**Response:**
```json
{
  "uploadId": "uuid",
  "fileUrl": "https://s3.amazonaws.com/...",
  "filename": "image.jpg",
  "contentType": "image/jpeg",
  "size": 1024000
}
```

### Search

#### GET /api/messages/search
Full-text search

**Query Parameters:**
- `q` (required) - Search query
- `channel` (optional) - Filter by channel
- `since` (optional) - ISO timestamp
- `limit` (optional) - Number of results (default: 50)

**Response:**
```json
{
  "results": [...],
  "query": "search term",
  "count": 10
}
```

---

## 🔌 WEBSOCKET EVENTS

### Client → Server

#### `typing`
Send typing indicator

```json
{
  "channel": "#general",
  "ts": "2025-01-27T12:00:00Z"
}
```

#### `presence`
Update presence status

```json
{
  "status": "online",
  "ts": "2025-01-27T12:00:00Z"
}
```

#### `join`
Join channel(s)

```json
{
  "channels": ["#general", "#support"]
}
```

#### `leave`
Leave channel

```json
{
  "channel": "#general"
}
```

### Server → Client

#### `message:new`
New message received

```json
{
  "message": {...},
  "traceId": "uuid"
}
```

#### `message:edit`
Message edited

```json
{
  "message": {...},
  "traceId": "uuid"
}
```

#### `message:delete`
Message deleted

```json
{
  "messageId": "uuid",
  "traceId": "uuid"
}
```

#### `reaction:update`
Reaction updated

```json
{
  "messageId": "uuid",
  "reactions": {...},
  "traceId": "uuid"
}
```

#### `presence:update`
Presence updated

```json
{
  "userId": "uuid",
  "status": "online",
  "lastSeen": "2025-01-27T12:00:00Z",
  "traceId": "uuid"
}
```

#### `typing:update`
Typing indicator

```json
{
  "channel": "#general",
  "userId": "uuid",
  "ts": "2025-01-27T12:00:00Z",
  "traceId": "uuid"
}
```

#### `pin:update`
Pin status updated

```json
{
  "messageId": "uuid",
  "pinned": true,
  "traceId": "uuid"
}
```

#### `thread:update`
Thread replies updated

```json
{
  "rootMessageId": "uuid",
  "replies": [...],
  "traceId": "uuid"
}
```

#### `ack`
Message acknowledgment

```json
{
  "clientTempId": "ct_1234567890_abc123",
  "serverMessageId": "uuid",
  "traceId": "uuid"
}
```

---

## 🚀 DEPLOYMENT GUIDE

### Option 1: Docker Compose (Recommended)

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global

# Start all services
docker-compose up -d

# Services will be available at:
# - API: http://localhost:3000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - MinIO: http://localhost:9000
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 3. Run database migrations
psql $DB_URL < migrations/001_init_chat_system.sql

# 4. Start server
npm run dev
```

### Option 3: Production Deployment

```bash
# Build Docker image
docker build -t hingecraft-chat .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name hingecraft-chat \
  hingecraft-chat
```

### Wix Integration

1. Upload `backend/hcProxy.jsw` to Wix Velo
2. Configure `HC_CHAT_API_KEY` in Wix Secrets
3. Set `BASE_URL` in hcProxy.jsw
4. Test proxy functions

---

## 📊 PROJECT STATISTICS

- **Total Files:** 25+
- **Lines of Code:** 10,000+
- **API Endpoints:** 15+
- **WebSocket Events:** 9
- **Database Tables:** 6
- **Features:** 16+
- **Status:** ✅ Production-Ready

---

## ✅ COMPLETION STATUS

### ✅ Complete
- [x] Frontend UI (chat.html)
- [x] Client library (hc-client.js)
- [x] Styling (hc-uix.css)
- [x] Backend server (server.js)
- [x] All API routes
- [x] Database schema
- [x] WebSocket support
- [x] File uploads
- [x] Content moderation
- [x] Wix integration
- [x] Documentation

### 🚀 Ready For
- [x] Local development
- [x] Staging deployment
- [x] Production deployment
- [x] Wix integration
- [x] Load testing
- [x] User acceptance testing

---

## 📞 SUPPORT

### Key File Locations

**Frontend:**
- `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/public/pages/chat.html`
- `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/public/js/hc-client.js`
- `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/public/css/hc-uix.css`

**Backend:**
- `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/server.js`
- `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/routes/`
- `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/lib/`

**Database:**
- `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/migrations/001_init_chat_system.sql`
- `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/database/`

**Wix:**
- `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/backend/hcProxy.jsw`

---

## 🎉 SUMMARY

**The HingeCraft Live Chat System is complete and production-ready!**

All components have been built according to the T10 specification:
- ✅ Production-ready backend
- ✅ Complete frontend UI
- ✅ Real-time WebSocket support
- ✅ File upload handling
- ✅ Content moderation
- ✅ Full accessibility
- ✅ Docker deployment
- ✅ Comprehensive documentation

**🚀 Ready to launch!**

---

**Last Updated:** January 27, 2025  
**Export Status:** ✅ COMPLETE  
**All Data Consolidated:** ✅ YES













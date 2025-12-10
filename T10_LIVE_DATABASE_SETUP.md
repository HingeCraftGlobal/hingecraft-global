# T10 Live Chat System - Live Database Integration

## 🎯 Overview

This guide explains how to connect the T10 HingeCraft Live Chat system to your existing live PostgreSQL database.

## 📋 Prerequisites

- PostgreSQL database running (local or remote)
- Node.js 16+ installed
- Access to database credentials

## 🔧 Database Connection

### Default Connection String

The system uses the following default connection format:
```
postgresql://user:password@host:port/database
```

### Environment Variables

Create a `.env` file in the project root with:

```bash
# Database Connection
DB_URL=postgresql://hc:hcpass@localhost:5432/hingecraft

# Alternative (if using different credentials):
# DB_URL=postgresql://hingecraft_user:hingecraft_secure_password_123@localhost:5432/hingecraft_db

# API Configuration
BASE_URL=http://localhost:3000
API_KEY=04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

# JWT Secret (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-long

# Redis (optional, for scaling)
REDIS_URL=redis://localhost:6379

# S3 Configuration (for file uploads)
S3_BUCKET=hingecraft-chat-uploads
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,https://www.hingecraft-global.ai

# Rate Limiting
RATE_LIMIT_REQ_PER_MIN=100

# Logging
LOG_LEVEL=info

# WebSocket Path
WS_PATH=/ws
```

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
cd hingecraft-global
npm install
```

### 2. Configure Environment

Copy the environment variables above to a `.env` file and update with your actual database credentials.

### 3. Apply Database Migrations

Run the migration script to create the chat system tables:

```bash
npm run migrate:chat
```

Or manually:

```bash
node scripts/apply_chat_migrations.js
```

This will create the following tables:
- `users` - Chat system users
- `messages` - Chat messages with threading
- `read_receipts` - Read receipts per user
- `uploads` - File upload tracking
- `idempotency_keys` - Idempotency protection
- `moderation_logs` - Content moderation logs

### 4. Start the Server

```bash
npm run dev
```

Or for production:

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `PORT` environment variable).

## 🔌 API Endpoints

Once running, the following endpoints are available:

### Authentication
- `POST /api/auth/anon` - Create anonymous session
- `GET /api/auth/identify` - Identify user from token

### Messages
- `POST /api/messages` - Create message
- `GET /api/messages?channel=#general` - Get messages
- `POST /api/messages/:id/edit` - Edit message
- `POST /api/messages/:id/delete` - Delete message
- `POST /api/messages/:id/reaction` - Toggle reaction
- `POST /api/messages/:id/pin` - Pin message (admin)
- `POST /api/messages/:id/read` - Mark as read

### Uploads
- `POST /api/uploads/request` - Request upload URL
- `POST /api/uploads/complete` - Complete upload

### Search
- `GET /api/messages/search?q=query` - Search messages

## 🌐 WebSocket Connection

WebSocket endpoint: `ws://localhost:3000/ws` (or `wss://` for HTTPS)

The client connects automatically when you load `chat.html`.

## 📄 Frontend Integration

### Using chat.html

The `chat.html` file automatically connects to the backend using `window.location.origin`, so it will work with:
- Local development: `http://localhost:3000`
- Production: `https://your-domain.com`

### Client Configuration

The chat client is initialized in `chat.html`:

```javascript
const client = new HingeCraftChatClient({
    baseUrl: window.location.origin,  // Automatically uses current domain
    channels: ['#general', '#support', '#random'],
    defaultChannel: '#general'
});
```

## 🔒 Security Notes

1. **JWT Secret**: Use a strong, random secret (minimum 32 characters)
2. **Database Password**: Never commit database passwords to git
3. **API Key**: Keep your API key secure
4. **CORS**: Configure CORS origins to only allow your domains

## 🐛 Troubleshooting

### Database Connection Issues

If you see connection errors:

1. Verify database is running:
   ```bash
   psql -h localhost -U hc -d hingecraft
   ```

2. Check connection string format:
   ```
   postgresql://user:password@host:port/database
   ```

3. Verify network access (for remote databases):
   - Check firewall rules
   - Verify SSL settings if required

### Migration Errors

If migrations fail:

1. Check if tables already exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('users', 'messages', 'read_receipts', 'uploads', 'idempotency_keys', 'moderation_logs');
   ```

2. The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### WebSocket Connection Issues

1. Verify WebSocket path matches `WS_PATH` environment variable
2. Check CORS settings allow your frontend domain
3. Verify JWT token is valid (check expiration)

## ✅ Verification

After setup, verify everything works:

1. **Health Check**:
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Create Anonymous Session**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/anon \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User"}'
   ```
   Should return user object and JWT token.

3. **Load chat.html**:
   Open `http://localhost:3000/pages/chat.html` in your browser.
   The chat should initialize and connect to WebSocket.

## 📚 Additional Resources

- See `README.md` for full API documentation
- See `T10_PROJECT_STRUCTURE.md` for project structure
- See `migrations/001_init_chat_system.sql` for database schema

## 🎉 Success!

Once everything is set up, your chat system is ready to use! All messages and events are stored in the database and broadcast via WebSocket.






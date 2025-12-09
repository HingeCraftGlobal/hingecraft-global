# HingeCraft Live Chat System

Production-ready real-time chat system with WebSocket support, file uploads, content moderation, and full accessibility compliance.

## Features

- ✅ Real-time messaging with WebSocket (Socket.IO)
- ✅ File attachments with S3-compatible storage
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

## Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- Redis 6+ (optional, for scaling)
- Docker & Docker Compose (for containerized setup)

### Local Development

1. **Clone and install:**
```bash
cd hingecraft-global
npm install
```

2. **Set up environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run database migrations:**
```bash
psql $DB_URL < migrations/001_init_chat_system.sql
```

4. **Start with Docker Compose:**
```bash
docker-compose up
```

Or start manually:
```bash
# Terminal 1: PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=changeme postgres:15

# Terminal 2: Redis (optional)
docker run -d -p 6379:6379 redis:7

# Terminal 3: Server
npm run dev
```

5. **Access:**
- API: http://localhost:3000
- WebSocket: ws://localhost:3000/ws
- Health: http://localhost:3000/health

## API Endpoints

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
- `GET /api/messages/:id/thread` - Get thread replies

### Uploads
- `POST /api/uploads/request` - Request upload URL
- `POST /api/uploads/complete` - Complete upload

### Search
- `GET /api/messages/search?q=query` - Search messages

## WebSocket Events

### Client → Server
- `typing` - Send typing indicator
- `presence` - Update presence status
- `join` - Join channel(s)
- `leave` - Leave channel
- `ack` - Acknowledge message

### Server → Client
- `message:new` - New message
- `message:edit` - Message edited
- `message:delete` - Message deleted
- `reaction:update` - Reactions updated
- `presence:update` - User presence changed
- `typing:update` - Typing indicator
- `pin:update` - Message pinned/unpinned
- `thread:update` - Thread replies updated
- `ack` - Message acknowledgment

## Frontend Integration

### Using the Client Library

```html
<script src="/js/hc-client.js"></script>
<link rel="stylesheet" href="/css/hc-uix.css">
```

```javascript
const client = new HingeCraftChatClient({
  baseUrl: 'http://localhost:3000',
  channels: ['#general', '#support'],
  defaultChannel: '#general'
});

// Initialize
await client.init();

// Set up event handlers
client.onMessageReceived = (message) => {
  // Add message to UI
  console.log('New message:', message);
};

client.onTypingUpdate = (channel, userId, ts) => {
  // Show typing indicator
  console.log('User typing:', userId);
};

// Send message
await client.sendMessage('#general', 'Hello!');

// Upload file
const file = document.querySelector('input[type="file"]').files[0];
await client.uploadFile(file, '#general', 'ct_temp_123');
```

## Wix Integration

Use the Wix Velo middleware (`backend/hcProxy.jsw`):

```javascript
import { createMessage } from 'backend/hcProxy';

// In your Wix page code
const result = await createMessage({
  channel: '#general',
  text: 'Hello from Wix!',
  clientTempId: 'ct_' + Date.now()
});
```

## Environment Variables

See `.env.example` for all required variables:

- `BASE_URL` - Backend API URL
- `DB_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection (optional)
- `JWT_SECRET` - JWT signing secret
- `S3_BUCKET` - S3 bucket name
- `API_KEY` - API key for Wix proxy authentication
- `RATE_LIMIT_REQ_PER_MIN` - Rate limit (default: 100)

## Testing

```bash
npm test
```

## Deployment

### Docker

```bash
docker build -t hingecraft-chat .
docker run -p 3000:3000 --env-file .env hingecraft-chat
```

### Kubernetes

See `k8s/` directory for Kubernetes manifests.

### Render/Heroku

1. Set environment variables
2. Deploy: `git push heroku main`
3. Run migrations: `heroku run npm run migrate`

## Architecture

```
┌─────────────┐
│  Wix Pages  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Wix Velo    │
│ (hcProxy)   │
└──────┬──────┘
       │ HMAC
       ▼
┌─────────────┐
│ Node/Express│
│   Backend   │
└──────┬──────┘
       │
   ┌───┴───┐
   ▼       ▼
┌─────┐ ┌─────┐
│Postgres│ │Redis│
└─────┘ └─────┘
       │
       ▼
┌─────────────┐
│ Socket.IO   │
│ WebSocket   │
└─────────────┘
```

## Security

- JWT authentication (30-day expiry)
- HMAC-signed proxy requests
- Rate limiting (Redis-based)
- Content moderation (async queue)
- XSS protection (input sanitization)
- CORS configuration
- SQL injection protection (parameterized queries)

## Performance

- Horizontal WebSocket scaling (Redis adapter)
- Database connection pooling
- Full-text search indexing
- Optimistic UI updates
- Idempotency protection

## License

MIT

## Support

For issues and questions, see the documentation or open an issue.

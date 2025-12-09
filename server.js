/**
 * HingeCraft Live Chat - Main Server
 * Node/Express backend with Socket.IO WebSocket support
 * T10 Specification Implementation
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Redis = require('ioredis');
const RedisAdapter = require('socket.io-redis');

// Initialize modules
const db = require('./lib/db');
const auth = require('./lib/auth');
const uploads = require('./lib/uploads');
const moderation = require('./lib/moderation');

// Routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/uploads');
const searchRoutes = require('./routes/search');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: process.env.WS_PATH || '/ws',
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST']
  }
});

// Initialize Redis adapter for horizontal scaling
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
  const adapter = RedisAdapter({ pubClient: redisClient, subClient: redisClient.duplicate() });
  io.adapter(adapter);
  console.log('Redis adapter initialized for WebSocket scaling');
}

// Store io instance in app for route access
app.set('io', io);

// Initialize database
db.initDB(process.env.DB_URL);
console.log('Database initialized');

// Initialize authentication
auth.initAuth(process.env.JWT_SECRET);
console.log('Authentication initialized');

// Initialize S3 uploads
if (process.env.S3_BUCKET) {
  uploads.initS3({
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  });
  console.log('S3 uploads initialized');
}

// Initialize moderation
if (process.env.REDIS_URL) {
  moderation.initModeration(process.env.REDIS_URL);
  moderation.startModerationWorker();
  console.log('Moderation system initialized');
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting (basic implementation - use Redis for production)
const rateLimitMap = new Map();
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_REQ_PER_MIN) || 100;

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const limit = rateLimitMap.get(ip);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + windowMs;
    return next();
  }

  if (limit.count >= RATE_LIMIT) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((limit.resetTime - now) / 1000)
    });
  }

  limit.count++;
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/messages/search', searchRoutes);

// WebSocket authentication and connection handling
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (!token) {
    return next(new Error('Authentication token required'));
  }

  try {
    const decoded = auth.verifyToken(token);
    socket.userId = decoded.sub;
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join channel rooms
  socket.on('join', (channels) => {
    if (Array.isArray(channels)) {
      channels.forEach(channel => socket.join(channel));
    } else {
      socket.join(channels);
    }
  });

  // Leave channel
  socket.on('leave', (channel) => {
    socket.leave(channel);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { channel, ts } = data;
    socket.to(channel).emit('typing:update', {
      channel,
      userId: socket.userId,
      ts: ts || new Date().toISOString(),
      traceId: require('uuid').v4()
    });
  });

  // Presence update
  socket.on('presence', (data) => {
    const { status, ts } = data;
    
    // Update user last seen
    db.updateUserLastSeen(socket.userId).catch(err => {
      console.error('Failed to update last seen:', err);
    });

    // Broadcast presence
    socket.broadcast.emit('presence:update', {
      userId: socket.userId,
      status: status || 'online',
      lastSeen: new Date().toISOString(),
      traceId: require('uuid').v4()
    });
  });

  // Acknowledge message (for optimistic UI)
  socket.on('ack', (data) => {
    // Server emits ack when message is persisted (handled in routes)
    // This is just for client-to-server acknowledgment
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    
    // Broadcast offline status
    socket.broadcast.emit('presence:update', {
      userId: socket.userId,
      status: 'offline',
      lastSeen: new Date().toISOString(),
      traceId: require('uuid').v4()
    });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    traceId: require('uuid').v4()
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HingeCraft Chat Server running on port ${PORT}`);
  console.log(`WebSocket path: ${process.env.WS_PATH || '/ws'}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
  io.close(() => {
    console.log('WebSocket server closed');
  });
  await db.close();
  if (redisClient) {
    redisClient.quit();
  }
  process.exit(0);
});

module.exports = { app, server, io };


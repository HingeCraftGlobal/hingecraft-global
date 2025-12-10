/**
 * HingeCraft Live Chat Client Library
 * T10 Specification - WebSocket & REST Helper Functions
 * 
 * Provides:
 * - WebSocket connection management (Socket.IO)
 * - REST API client with authentication
 * - Optimistic UI updates
 * - Idempotency handling
 * - Error handling and retries
 */

class HingeCraftChatClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    this.wsUrl = config.wsUrl || this.baseUrl.replace(/^http/, 'ws');
    this.token = null;
    this.user = null;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.typingTimeout = null;
    this.presenceInterval = null;
    this.pendingMessages = new Map(); // clientTempId -> message element
    this.channels = config.channels || ['#general'];
    this.currentChannel = config.defaultChannel || '#general';
    
    // Load token from localStorage
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('hc_token');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          this.token = data.token;
          this.user = data.user;
        } catch (e) {
          console.error('Failed to parse stored token:', e);
        }
      }
    }
  }

  /**
   * Generate unique client temp ID
   */
  generateClientTempId() {
    return 'ct_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate UUID v4
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Initialize client - authenticate and connect WebSocket
   */
  async init() {
    try {
      // Try to identify existing user
      if (this.token) {
        const user = await this.identify();
        if (user) {
          this.user = user;
          await this.connectWebSocket();
          return { user, token: this.token };
        }
      }

      // Create anonymous session
      const result = await this.createAnonymousSession();
      this.user = result.user;
      this.token = result.token;
      
      // Store in localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hc_token', JSON.stringify({
          user: this.user,
          token: this.token
        }));
      }

      await this.connectWebSocket();
      return result;
    } catch (error) {
      console.error('Failed to initialize chat client:', error);
      throw error;
    }
  }

  /**
   * Create anonymous session
   */
  async createAnonymousSession(name) {
    const response = await fetch(`${this.baseUrl}/api/auth/anon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || `User_${Date.now()}` })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create anonymous session');
    }

    return await response.json();
  }

  /**
   * Identify existing user
   */
  async identify() {
    if (!this.token) return null;

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/identify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, clear it
          this.token = null;
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('hc_token');
          }
          return null;
        }
        throw new Error('Failed to identify user');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Identify error:', error);
      return null;
    }
  }

  /**
   * Connect WebSocket
   */
  async connectWebSocket() {
    if (!this.token) {
      throw new Error('No token available for WebSocket connection');
    }

    return new Promise((resolve, reject) => {
      // Use Socket.IO if available, otherwise fallback to native WebSocket
      if (typeof io !== 'undefined') {
        this.socket = io(this.wsUrl, {
          path: '/ws',
          transports: ['websocket'],
          auth: {
            token: this.token
          },
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionAttempts: this.maxReconnectAttempts
        });

        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.setupWebSocketHandlers();
          this.startPresenceHeartbeat();
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('WebSocket disconnected');
          this.stopPresenceHeartbeat();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(error);
          }
        });
      } else {
        // Fallback to native WebSocket (basic implementation)
        const wsProtocol = this.wsUrl.startsWith('wss') ? 'wss' : 'ws';
        const url = `${this.wsUrl}/ws?token=${encodeURIComponent(this.token)}`;
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.setupWebSocketHandlers();
          this.startPresenceHeartbeat();
          resolve();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.socket.onclose = () => {
          console.log('WebSocket closed');
          this.stopPresenceHeartbeat();
        };
      }
    });
  }

  /**
   * Setup WebSocket event handlers
   */
  setupWebSocketHandlers() {
    if (!this.socket) return;

    const emit = (event, data) => {
      if (typeof io !== 'undefined' && this.socket.emit) {
        this.socket.emit(event, data);
      } else if (this.socket.send) {
        this.socket.send(JSON.stringify({ event, data }));
      }
    };

    const on = (event, handler) => {
      if (typeof io !== 'undefined' && this.socket.on) {
        this.socket.on(event, handler);
      } else if (this.socket.addEventListener) {
        this.socket.addEventListener('message', (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.event === event) {
              handler(msg.data);
            }
          } catch (err) {
            // Ignore non-JSON messages
          }
        });
      }
    };

    // Server events
    on('message:new', (data) => {
      this.handleMessageNew(data.message);
    });

    on('message:edit', (data) => {
      this.handleMessageEdit(data.message);
    });

    on('message:delete', (data) => {
      this.handleMessageDelete(data.messageId);
    });

    on('reaction:update', (data) => {
      this.handleReactionUpdate(data.messageId, data.reactions);
    });

    on('presence:update', (data) => {
      this.handlePresenceUpdate(data.userId, data.status, data.lastSeen);
    });

    on('typing:update', (data) => {
      this.handleTypingUpdate(data.channel, data.userId, data.ts);
    });

    on('pin:update', (data) => {
      this.handlePinUpdate(data.messageId, data.pinned);
    });

    on('thread:update', (data) => {
      this.handleThreadUpdate(data.rootMessageId, data.replies);
    });

    on('ack', (data) => {
      this.handleAck(data.clientTempId, data.serverMessageId);
    });
  }

  /**
   * Send message
   */
  async sendMessage(channel, text, options = {}) {
    const clientTempId = options.clientTempId || this.generateClientTempId();
    const parentId = options.parentId || null;
    const attachments = options.attachments || [];

    // Validate
    if (!text || text.trim().length === 0) {
      throw new Error('Message text cannot be empty');
    }
    if (text.length > 5000) {
      throw new Error('Message text cannot exceed 5000 characters');
    }
    if (attachments.length > 10) {
      throw new Error('Cannot attach more than 10 files');
    }

    const totalSize = attachments.reduce((sum, att) => sum + (att.size || 0), 0);
    if (totalSize > 12 * 1024 * 1024) {
      throw new Error('Total attachment size cannot exceed 12MB');
    }

    // Optimistically add to UI
    const optimisticMessage = {
      id: clientTempId,
      channel,
      user_id: this.user.id,
      text,
      ts: new Date().toISOString(),
      parent_id: parentId,
      attachments,
      reactions: {},
      pinned: false,
      edited: false,
      pending: true,
      clientTempId
    };

    if (this.onMessageOptimistic) {
      this.onMessageOptimistic(optimisticMessage);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': clientTempId
        },
        body: JSON.stringify({
          channel,
          text,
          parentId,
          attachments,
          clientTempId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      
      // Replace optimistic message with real one
      if (this.onMessageReceived) {
        this.onMessageReceived(data.message);
      }

      return data.message;
    } catch (error) {
      // Remove optimistic message on error
      if (this.onMessageError) {
        this.onMessageError(clientTempId, error);
      }
      throw error;
    }
  }

  /**
   * Request file upload URL
   */
  async requestUpload(filename, contentType, size, channel, messageTempId) {
    const response = await fetch(`${this.baseUrl}/api/uploads/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename,
        contentType,
        size,
        channel,
        messageTempId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to request upload');
    }

    return await response.json();
  }

  /**
   * Complete file upload
   */
  async completeUpload(uploadId, messageTempId) {
    const response = await fetch(`${this.baseUrl}/api/uploads/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uploadId,
        messageTempId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to complete upload');
    }

    return await response.json();
  }

  /**
   * Upload file (full flow)
   */
  async uploadFile(file, channel, messageTempId) {
    // Request upload URL
    const uploadInfo = await this.requestUpload(
      file.name,
      file.type,
      file.size,
      channel,
      messageTempId
    );

    // Upload to S3
    const uploadResponse = await fetch(uploadInfo.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to storage');
    }

    // Complete upload
    return await this.completeUpload(uploadInfo.uploadId, messageTempId);
  }

  /**
   * Get messages
   */
  async getMessages(channel, options = {}) {
    const params = new URLSearchParams({
      channel: channel || this.currentChannel,
      limit: options.limit || 50
    });

    if (options.since) {
      params.append('since', options.since);
    }
    if (options.after) {
      params.append('after', options.after);
    }

    const response = await fetch(`${this.baseUrl}/api/messages?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get messages');
    }

    return await response.json();
  }

  /**
   * Edit message
   */
  async editMessage(messageId, text) {
    const response = await fetch(`${this.baseUrl}/api/messages/${messageId}/edit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to edit message');
    }

    return await response.json();
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId) {
    const response = await fetch(`${this.baseUrl}/api/messages/${messageId}/delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete message');
    }

    return await response.json();
  }

  /**
   * Toggle reaction
   */
  async toggleReaction(messageId, emoji) {
    const response = await fetch(`${this.baseUrl}/api/messages/${messageId}/reaction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ emoji })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle reaction');
    }

    return await response.json();
  }

  /**
   * Pin message (admin only)
   */
  async pinMessage(messageId) {
    const response = await fetch(`${this.baseUrl}/api/messages/${messageId}/pin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to pin message');
    }

    return await response.json();
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId) {
    const response = await fetch(`${this.baseUrl}/api/messages/${messageId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: this.user.id })
    });

    if (!response.ok) {
      // Non-critical, don't throw
      console.warn('Failed to mark message as read');
    }
  }

  /**
   * Search messages
   */
  async searchMessages(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      limit: options.limit || 50
    });

    if (options.channel) {
      params.append('channel', options.channel);
    }
    if (options.since) {
      params.append('since', options.since);
    }

    const response = await fetch(`${this.baseUrl}/api/messages/search?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search messages');
    }

    return await response.json();
  }

  /**
   * Send typing indicator (throttled)
   */
  sendTyping(channel) {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => {
      if (this.socket && this.user) {
        const emit = (event, data) => {
          if (typeof io !== 'undefined' && this.socket.emit) {
            this.socket.emit(event, data);
          } else if (this.socket.send) {
            this.socket.send(JSON.stringify({ event, data }));
          }
        };

        emit('typing', {
          channel: channel || this.currentChannel,
          userId: this.user.id,
          ts: new Date().toISOString()
        });
      }
    }, 1500);
  }

  /**
   * Start presence heartbeat
   */
  startPresenceHeartbeat() {
    this.stopPresenceHeartbeat(); // Clear any existing interval

    this.presenceInterval = setInterval(() => {
      if (this.socket && this.user) {
        const emit = (event, data) => {
          if (typeof io !== 'undefined' && this.socket.emit) {
            this.socket.emit(event, data);
          } else if (this.socket.send) {
            this.socket.send(JSON.stringify({ event, data }));
          }
        };

        emit('presence', {
          userId: this.user.id,
          status: 'online',
          ts: new Date().toISOString()
        });
      }
    }, 8000); // Every 8 seconds
  }

  /**
   * Stop presence heartbeat
   */
  stopPresenceHeartbeat() {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }
  }

  /**
   * Event handlers (to be overridden by UI)
   */
  handleMessageNew(message) {
    if (this.onMessageReceived) {
      this.onMessageReceived(message);
    }
  }

  handleMessageEdit(message) {
    if (this.onMessageEdit) {
      this.onMessageEdit(message);
    }
  }

  handleMessageDelete(messageId) {
    if (this.onMessageDelete) {
      this.onMessageDelete(messageId);
    }
  }

  handleReactionUpdate(messageId, reactions) {
    if (this.onReactionUpdate) {
      this.onReactionUpdate(messageId, reactions);
    }
  }

  handlePresenceUpdate(userId, status, lastSeen) {
    if (this.onPresenceUpdate) {
      this.onPresenceUpdate(userId, status, lastSeen);
    }
  }

  handleTypingUpdate(channel, userId, ts) {
    if (this.onTypingUpdate) {
      this.onTypingUpdate(channel, userId, ts);
    }
  }

  handlePinUpdate(messageId, pinned) {
    if (this.onPinUpdate) {
      this.onPinUpdate(messageId, pinned);
    }
  }

  handleThreadUpdate(rootMessageId, replies) {
    if (this.onThreadUpdate) {
      this.onThreadUpdate(rootMessageId, replies);
    }
  }

  handleAck(clientTempId, serverMessageId) {
    if (this.onAck) {
      this.onAck(clientTempId, serverMessageId);
    }
  }

  /**
   * Disconnect
   */
  disconnect() {
    this.stopPresenceHeartbeat();
    if (this.socket) {
      if (typeof io !== 'undefined' && this.socket.disconnect) {
        this.socket.disconnect();
      } else if (this.socket.close) {
        this.socket.close();
      }
      this.socket = null;
    }
  }
}

// Export for use in modules or global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HingeCraftChatClient;
} else if (typeof window !== 'undefined') {
  window.HingeCraftChatClient = HingeCraftChatClient;
}






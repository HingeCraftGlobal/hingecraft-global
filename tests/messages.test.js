/**
 * Message API Tests
 * Tests for message CRUD operations, reactions, pins
 */

const request = require('supertest');
const { app } = require('../server');
const db = require('../lib/db');

describe('Messages API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Initialize test database
    // Create test user and get token
    const response = await request(app)
      .post('/api/auth/anon')
      .send({ name: 'Test User' });
    
    authToken = response.body.token;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    await db.close();
  });

  describe('POST /api/messages', () => {
    it('should create a message', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', 'test-idempotency-1')
        .send({
          channel: '#general',
          text: 'Test message',
          clientTempId: 'ct_test_001'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
      expect(response.body.message.text).toBe('Test message');
      expect(response.body.message.channel).toBe('#general');
      expect(response.body.clientTempId).toBe('ct_test_001');
    });

    it('should enforce idempotency', async () => {
      const idempotencyKey = 'test-idempotency-2';
      
      const response1 = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          channel: '#general',
          text: 'Idempotent message',
          clientTempId: 'ct_test_002'
        });

      const response2 = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          channel: '#general',
          text: 'Idempotent message',
          clientTempId: 'ct_test_002'
        });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.message.id).toBe(response2.body.message.id);
    });

    it('should reject message over 5000 characters', async () => {
      const longText = 'a'.repeat(5001);
      
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          channel: '#general',
          text: longText
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('5000');
    });

    it('should reject more than 10 attachments', async () => {
      const attachments = Array(11).fill({ name: 'test.jpg', size: 1000 });
      
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          channel: '#general',
          text: 'Test',
          attachments
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('10');
    });
  });

  describe('GET /api/messages', () => {
    it('should get messages for channel', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ channel: '#general', limit: 50 });

      expect(response.status).toBe(200);
      expect(response.body.messages).toBeDefined();
      expect(Array.isArray(response.body.messages)).toBe(true);
    });
  });

  describe('POST /api/messages/:id/reaction', () => {
    let messageId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          channel: '#general',
          text: 'Test for reaction'
        });
      messageId = response.body.message.id;
    });

    it('should toggle reaction', async () => {
      const response = await request(app)
        .post(`/api/messages/${messageId}/reaction`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ emoji: '👍' });

      expect(response.status).toBe(200);
      expect(response.body.reactions).toBeDefined();
    });
  });
});


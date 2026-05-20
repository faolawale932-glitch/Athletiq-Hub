import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../index';

let authToken: string;
let userId: string;
let resultId: string;

describe('Athletiq Hub API Tests', () => {
  // AUTH TESTS
  describe('Authentication', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token;
      userId = res.body.user.id;
    });

    it('should login user', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });

  // RESULTS TESTS
  describe('Results', () => {
    it('should get all results', async () => {
      const res = await request(app).get('/api/v1/results');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should create a result', async () => {
      const res = await request(app)
        .post('/api/v1/results')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Marathon Victory',
          description: 'Completed 42K marathon',
          category: 'Running',
          performance: 3.5,
          performanceUnit: 'hours',
          location: 'NYC',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Marathon Victory');
      resultId = res.body.id;
    });

    it('should update a result', async () => {
      const res = await request(app)
        .put(`/api/v1/results/${resultId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Marathon Victory' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Marathon Victory');
    });
  });

  // COMMENTS TESTS
  describe('Comments', () => {
    it('should add a comment', async () => {
      const res = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ resultId, content: 'Great achievement!' });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe('Great achievement!');
    });
  });

  // LIKES TESTS
  describe('Likes', () => {
    it('should like a result', async () => {
      const res = await request(app)
        .post('/api/v1/likes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ resultId });

      expect(res.status).toBe(201);
      expect(res.body.resultId).toBe(resultId);
    });
  });

  // HEALTH CHECK
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('API is running');
    });
  });
});

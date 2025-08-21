import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app, { startServer } from '../server';
import jwt from 'jsonwebtoken';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(() => Promise.resolve({ data: [{ generated_text: 'stubbed LLM reply' }] } as any)),
  },
}));

describe('POST /api/chat', () => {
  let mongod: MongoMemoryServer;
  const token = jwt.sign({ userId: 'u1', email: 'u@x.com', role: 'rep' }, process.env.JWT_SECRET || 'test');
  beforeAll(async () => {
    // Ensure route sees an API key
    process.env.HUGGINGFACE_API_KEY = 'hf-test';
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('requires auth', async () => {
    await request(app).post('/api/chat').send({ message: 'hi' }).expect(401);
  });

  it('returns LLM reply on GENERAL', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'hello' })
      .expect(200);
    expect(res.body.reply).toBe('stubbed LLM reply');
  });
});



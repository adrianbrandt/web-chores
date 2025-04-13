import express from 'express';
import request from 'supertest';
import { authLimiter } from '@/middleware/limiter';
import { ServerErrors } from '@/utils/errorCases';

describe('authLimiter middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use('/test', authLimiter);
    app.get('/test', (req, res) => {
      res.status(200).json({ message: 'Success' });
    });
  });

  it('should allow up to 5 requests', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Success' });
    }
  });

  it('should block the 6th request with 429', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).get('/test');
    }

    const res = await request(app).get('/test');
    expect(res.status).toBe(429);
    expect(res.body).toEqual(ServerErrors.RateLimitExceed());
  });
});

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp } from './utils/test-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { app: testApp } = await setupTestApp();
    app = testApp;
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('/api/health (GET)', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          status: 'healthy',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          memoryUsage: expect.any(Number),
        }),
        message: expect.any(String),
      });

      // Validate timestamp is a valid ISO string
      expect(() => new Date(response.body.data.timestamp)).not.toThrow();

      // Validate uptime is a positive number
      expect(response.body.data.uptime).toBeGreaterThan(0);

      // Validate memory usage is a positive number
      expect(response.body.data.memoryUsage).toBeGreaterThan(0);
    });
  });
});

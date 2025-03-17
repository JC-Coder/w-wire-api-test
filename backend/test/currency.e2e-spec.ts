import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp } from './utils/test-utils';
import { BaseHelper } from '../src/common/utils/helper/helper.util';
import { User } from '../src/module/database/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '../src/module/database/entities/transaction.entity';

describe('CurrencyController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userRepository: Repository<User>;
  let transactionRepository: Repository<Transaction>;

  beforeAll(async () => {
    const { app: testApp, moduleFixture } = await setupTestApp();
    app = testApp;

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    transactionRepository = moduleFixture.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );

    // Create a test user
    const hashedPassword = await BaseHelper.hashData('Password123!');
    await userRepository.save({
      username: 'testuser',
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  });

  afterAll(async () => {
    // Clean up test data after each test
    await userRepository.delete({});
    await transactionRepository.delete({});

    await teardownTestApp(app);
  });

  describe('/api/auth/login (POST)', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'Password123!',
        })
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          accessToken: expect.any(String),
          user: expect.objectContaining({
            id: expect.any(String),
            username: 'testuser',
          }),
        },
        message: 'Login successful',
      });
      authToken = response.body.data.accessToken;
    });
  });

  describe('/api/exchange-rates (GET)', () => {
    it('should return current exchange rates', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/exchange-rates')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          base: expect.any(String),
          rates: expect.any(Object),
          timestamp: expect.any(Number),
        }),
        message: 'Exchange rates retrieved successfully',
      });
    });
  });

  describe('/api/convert (POST)', () => {
    it('should convert currency successfully with valid token and data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/convert')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          fromCurrency: 'USD',
          toCurrency: 'EUR',
        })
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          amount: 100,
          rate: expect.any(Number),
          result: expect.any(Number),
        }),
        message: 'Currency converted successfully',
      });
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/convert')
        .send({
          amount: 100,
          fromCurrency: 'USD',
          toCurrency: 'EUR',
        })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        data: expect.any(Object),
        message: expect.any(String),
        errorCode: 'UNAUTHORIZED',
      });
    });

    it('should fail with invalid currency codes', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/convert')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          fromCurrency: 'CCC',
          toCurrency: 'BBB',
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        data: expect.any(Object),
        message: 'Invalid currency code',
        errorCode: 'BAD_REQUEST',
      });
    });

    it('should fail with negative amount', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/convert')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: -100,
          fromCurrency: 'USD',
          toCurrency: 'EUR',
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        data: expect.any(Object),
        message: expect.any(String),
        errorCode: 'BAD_REQUEST',
      });
    });
  });
});

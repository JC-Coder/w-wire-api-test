import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { User } from '../src/module/database/entities/user.entity';
import { Transaction } from '../src/module/database/entities/transaction.entity';
import { BaseHelper } from '../src/common/utils/helper/helper.util';
import { setupTestApp, teardownTestApp } from './utils/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let transactionRepository: Repository<Transaction>;
  let authToken: string;
  let testUser: User;

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
    testUser = await userRepository.save({
      username: 'testuser',
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    // Create some test transactions
    await Promise.all([
      transactionRepository.save({
        user: testUser,
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        result: 85,
        rate: 0.85,
      }),
      transactionRepository.save({
        user: testUser,
        amount: 200,
        fromCurrency: 'EUR',
        toCurrency: 'GBP',
        result: 170,
        rate: 0.85,
      }),
    ]);
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

  describe('/api/user/transactions (GET)', () => {
    it('should return user transactions with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/user/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.data.data).toHaveLength(2);
      for (const item of response.body.data.data) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('fromCurrency');
        expect(item).toHaveProperty('toCurrency');
        expect(item).toHaveProperty('amount');
        expect(item).toHaveProperty('result');
      }
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty(
        'message',
        'Transactions retrieved successfully',
      );
      expect(response.body).toHaveProperty('data.meta');
      expect(response.body.data.meta).toHaveProperty('page', 1);
      expect(response.body.data.meta).toHaveProperty('limit', 10);
      expect(response.body.data.meta).toHaveProperty('total', 2);
      expect(response.body.data.meta).toHaveProperty('totalPages', 1);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/user/transactions')
        .query({ page: 1, limit: 10 })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        data: expect.any(Object),
        message: expect.any(String),
        errorCode: 'UNAUTHORIZED',
      });
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/user/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 0, limit: 0 })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        data: expect.any(Object),
        message: expect.any(String),
        errorCode: 'BAD_REQUEST',
      });
    });

    it('should return empty array when no transactions exist', async () => {
      // Delete all test transactions
      await transactionRepository.delete({ user: testUser });

      const response = await request(app.getHttpServer())
        .get('/api/user/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.data.meta.total).toEqual(0);
      expect(response.body.data.meta.page).toEqual(1);
      expect(response.body.data.meta.limit).toEqual(10);
      expect(response.body.data.data).toEqual([]);
      expect(response.body.message).toEqual(
        'Transactions retrieved successfully',
      );
    });
  });
});

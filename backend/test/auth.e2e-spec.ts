import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseTestModule } from '../src/module/database/database-test.module';
import { ResponseTransformerInterceptor } from '../src/common/interceptors/response.interceptor';
import { Reflector } from '@nestjs/core';
import { HttpExceptionFilter } from '../src/common/filter/filter';
import { Repository } from 'typeorm';
import { User } from '../src/module/database/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BaseHelper } from '../src/common/utils/helper/helper.util';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [DatabaseTestModule, AppModule],
    });

    const moduleFixture: TestingModule = await moduleBuilder.compile();
    app = moduleFixture.createNestApplication();

    // Set up global pipes and interceptors as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(
      new ResponseTransformerInterceptor(app.get(Reflector)),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.setGlobalPrefix('/api');

    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  beforeEach(async () => {
    // Create a test user before each test
    const hashedPassword = await BaseHelper.hashData('Password123!');
    await userRepository.save({
      username: 'testuser',
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  });

  afterEach(async () => {
    // Clean up test data after each test
    await userRepository.delete({ username: 'testuser' });
  });

  afterAll(async () => {
    // Import and close the Redis connection
    const { CacheHelper } = await import(
      '../src/common/utils/cache-helper.util'
    );
    const cacheHelper = CacheHelper.getInstance();
    await cacheHelper.disconnect();

    // Close the NestJS app
    await app.close();
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
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongPassword',
        })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        data: expect.any(Object),
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS',
      });
    });

    it('should fail with invalid request body', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: '',
          password: '',
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        data: expect.any(Object),
        message: expect.any(String),
        errorCode: 'BAD_REQUEST',
      });
    });

    it('should lock account after 5 failed attempts', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            username: 'testuser',
            password: 'wrongPassword',
          })
          .expect(401);
      }

      // Try one more time to trigger the lock
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongPassword',
        })
        .expect(429);

      expect(response.body).toEqual({
        success: false,
        data: expect.any(Object),
        message: expect.stringContaining('Account is locked'),
        errorCode: 'ACCOUNT_LOCKED',
      });
    });
  });
});

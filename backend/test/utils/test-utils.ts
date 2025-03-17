import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { DatabaseTestModule } from '../../src/module/database/database-test.module';
import { ResponseTransformerInterceptor } from '../../src/common/interceptors/response.interceptor';
import { Reflector } from '@nestjs/core';
import { HttpExceptionFilter } from '../../src/common/filter/filter';
import { Connection, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

/**
 * Creates and configures a NestJS application for e2e testing
 */
export async function setupTestApp(): Promise<{
  app: INestApplication;
  moduleFixture: TestingModule;
}> {
  const moduleBuilder = Test.createTestingModule({
    imports: [DatabaseTestModule, AppModule],
  });

  const moduleFixture = await moduleBuilder.compile();
  const app = moduleFixture.createNestApplication();

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

  return { app, moduleFixture };
}

/**
 * Gets a repository for an entity
 */
export function getRepository<T extends object>(
  moduleFixture: TestingModule,
  entity: any,
): Repository<T> {
  return moduleFixture.get<Repository<T>>(getRepositoryToken(entity));
}

/**
 * Closes all connections and resources for the test app
 */
export async function teardownTestApp(app: INestApplication): Promise<void> {
  // Close database connection
  const connection = app.get(Connection);
  await connection.synchronize(true); // Clear DB
  await connection.close();

  // Close Redis connection
  const { CacheHelper } = await import(
    '../../src/common/utils/cache-helper.util'
  );
  const cacheHelper = CacheHelper.getInstance();
  await cacheHelper.disconnect();

  // Close the NestJS app
  await app.close();
}

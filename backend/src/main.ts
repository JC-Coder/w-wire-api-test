import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ENVIRONMENT_VARIABLES } from './common/configs/environment';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import * as compression from 'compression';
import { HttpExceptionFilter } from './common/filter/filter';
import { ResponseTransformerInterceptor } from './common/interceptors/response.interceptor';
import { CleanRequestMiddleware } from './common/middleware/cleanRequest.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { ValidationPipe } from '@nestjs/common';

const serverPort = ENVIRONMENT_VARIABLES.APP_PORT;

async function bootstrap() {
  // Correct way to define allowed origins
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    },
  });

  app.use(
    helmet({
      // Additional security headers
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: 'same-site' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
    }),
  );

  app.use(compression());

  // Setup security headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    // security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );

    // Hide server details
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', ''); // Remove server information
    res.setHeader('X-AspNet-Version', ''); // Remove ASP.NET version if present

    next();
  });

  // setup limit for request body
  app.use(express.json({ limit: '20kb' }));
  app.use(express.urlencoded({ limit: '20kb', extended: true }));

  /**
   * Rate limiting
   */
  app.use((req: Request, res: Response, next: NextFunction) =>
    new RateLimitMiddleware().use(req, res, next),
  );

  /**
   * interceptors
   */
  app.useGlobalInterceptors(
    new ResponseTransformerInterceptor(app.get(Reflector)),
  );

  /**
   * Set global exception filter
   */
  app.useGlobalFilters(new HttpExceptionFilter());

  /**
   * Set global prefix for routes
   */
  app.setGlobalPrefix('/api');

  /**
   *  Set global pipes
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Middlewares
  app.use((req: Request, res: Response, next: NextFunction) =>
    new CleanRequestMiddleware().use(req, res, next),
  );

  await app.listen(serverPort);

  console.log(`Server is running on port ${serverPort}`);
}
bootstrap().catch((error) => console.error('Error starting server:', error));

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CleanRequestMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // Clean request body
    const body = req.body as Record<string, unknown>;
    for (const key in body) {
      if (body[key] === '' || body[key] === null) {
        delete body[key];
      }
    }

    // Clean request query
    const query = req.query as Record<string, unknown>;
    for (const key in query) {
      if (query[key] === '' || query[key] === null) {
        delete query[key];
      }
    }

    next();
  }
}

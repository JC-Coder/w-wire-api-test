import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../filter/app-error.filter';
import { ERROR_CODES } from '../constants/error-codes.constant';

// stores the request count and timestamp for each IP address
const requestMap = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 20;

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip as string;
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    // Clean up old entries
    requestMap.forEach((data, key) => {
      if (data.timestamp < windowStart) {
        requestMap.delete(key);
      }
    });

    // Get existing request data for this IP
    const existingData = requestMap.get(ip);

    // Initialize or reset request data
    const requestData =
      existingData && existingData.timestamp >= windowStart
        ? existingData
        : { count: 0, timestamp: now };

    // Increment request count
    requestData.count++;

    // Store updated data
    requestMap.set(ip, requestData);

    // Check if limit exceeded
    if (requestData.count > MAX_REQUESTS_PER_WINDOW) {
      throw new AppError(
        'Too many requests, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
        ERROR_CODES.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
    res.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, MAX_REQUESTS_PER_WINDOW - requestData.count),
    );
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(requestData.timestamp + WINDOW_MS).toISOString(),
    );

    next();
  }
}

import { Redis } from 'ioredis';
import { ENVIRONMENT_VARIABLES } from '../configs/environment';

class CacheHelper {
  private redis: Redis;
  private static instance: CacheHelper | null;

  private constructor(redis?: Redis) {
    this.redis = redis || new Redis(ENVIRONMENT_VARIABLES.REDIS_DB_URL);

    // Listen to redis connection events without logging
    this.redis.on('error', (err) => {
      console.error('Redis Error', err);
    });
  }

  static getInstance(redis?: Redis): CacheHelper {
    if (!CacheHelper.instance) {
      CacheHelper.instance = new CacheHelper(redis);
    }
    return CacheHelper.instance;
  }

  static resetInstance(): void {
    CacheHelper.instance = null;
  }

  async setCache(
    key: string,
    value: string | number | object | boolean,
    expiry?: number,
  ): Promise<void> {
    try {
      const json = JSON.stringify(value);
      if (expiry) {
        await this.redis.set(key, json, 'EX', expiry);
      } else {
        await this.redis.set(key, json);
      }
    } catch (error) {
      console.log('Error in setCache: ', error);
    }
  }

  async getCache(key: string): Promise<string | object | null> {
    try {
      const json = await this.redis.get(key);

      if (json) {
        return JSON.parse(json) as string | object;
      }

      return null;
    } catch (error) {
      console.log('Error getting cache', error);
      return null;
    }
  }

  async removeFromCache(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.log('Error removing from cache: ', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// For production use
export const CacheHelperUtil = CacheHelper.getInstance();

// For testing purposes
export { CacheHelper };

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { ILoginResponse, ITokenPayload } from '../../common/types/auth.types';
import { BaseHelper } from '../../common/utils/helper/helper.util';
import { ERROR_CODES } from '../../common/constants/error-codes.constant';
import { AppError } from '../../common/filter/app-error.filter';
import { HttpStatus } from '@nestjs/common';
import {
  CACHE_EXPIRY,
  CACHE_KEYS,
} from '../../common/constants/cache.constant';
import { CacheHelperUtil } from '../../common/utils/cache-helper.util';

@Injectable()
export class AuthService {
  private readonly TOKEN_EXPIRY = CACHE_EXPIRY.ONE_HOUR;
  private readonly NONCE_EXPIRY = CACHE_EXPIRY.ONE_HOUR;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: LoginDto): Promise<ILoginResponse> {
    const { username, password } = payload;

    // Validate credentials
    const user = await this.userService.validateCredentials(username, password);

    if (!user) {
      throw new AppError(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    // Generate a unique nonce for this token
    const nonce = BaseHelper.generateRandomString(32);
    const timestamp = Math.floor(Date.now() / 1000);

    // Create token payload
    const tokenPayload: ITokenPayload = {
      sub: user.id,
      username: user.username,
      nonce,
      iat: timestamp,
      exp: timestamp + this.TOKEN_EXPIRY,
    };

    // Store nonce in Redis with expiry
    const nonceKey = CACHE_KEYS.NONCE_TRACKING(user.id, nonce);
    await CacheHelperUtil.setCache(nonceKey, timestamp, this.NONCE_EXPIRY);

    // Generate JWT token
    const accessToken = this.jwtService.sign(tokenPayload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async validateToken(payload: ITokenPayload): Promise<boolean> {
    // Check if token is blacklisted
    const blacklistKey = CACHE_KEYS.TOKEN_BLACKLIST(payload.sub, payload.nonce);
    const isBlacklisted = await CacheHelperUtil.getCache(blacklistKey);
    if (isBlacklisted) {
      return false;
    }

    // Check if nonce exists and hasn't expired
    const nonceKey = CACHE_KEYS.NONCE_TRACKING(payload.sub, payload.nonce);
    const storedTimestamp = await CacheHelperUtil.getCache(nonceKey);

    if (!storedTimestamp) {
      return false;
    }

    // Validate timestamp is within allowed window
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - Number(storedTimestamp) > this.TOKEN_EXPIRY) {
      await this.invalidateToken(payload);
      return false;
    }

    return true;
  }

  async invalidateToken(payload: ITokenPayload): Promise<void> {
    const { sub, nonce } = payload;
    // Add token to blacklist
    const blacklistKey = CACHE_KEYS.TOKEN_BLACKLIST(sub, nonce);
    await CacheHelperUtil.setCache(blacklistKey, true, this.TOKEN_EXPIRY);

    // Remove nonce from tracking
    const nonceKey = CACHE_KEYS.NONCE_TRACKING(sub, nonce);
    await CacheHelperUtil.removeFromCache(nonceKey);
  }
}

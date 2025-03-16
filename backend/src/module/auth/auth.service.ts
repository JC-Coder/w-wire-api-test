import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './types/auth.types';
import { BaseHelper } from '../../common/utils/helper/helper.util';
import { ERROR_CODES } from '../../common/constants/error-codes.constant';
import { AppError } from '../../common/filter/app-error.filter';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: LoginDto): Promise<LoginResponse> {
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
    const nonce = BaseHelper.generateRandomString(16);

    // Create token payload
    const tokenPayload = {
      sub: user.id,
      username: user.username,
      nonce,
      iat: Math.floor(Date.now() / 1000),
    };

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
}

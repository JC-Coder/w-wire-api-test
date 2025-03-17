import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { ENVIRONMENT_VARIABLES } from '../../../common/configs/environment';
import { ITokenPayload } from '../../../common/types/auth.types';
import { ERROR_CODES } from '../../../common/constants/error-codes.constant';
import { AppError } from '../../../common/filter/app-error.filter';
import { HttpStatus } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ENVIRONMENT_VARIABLES.JWT_SECRET,
    });
  }

  async validate(payload: ITokenPayload) {
    // Check if user exists
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Validate token using the new system
    const isValidToken = await this.authService.validateToken(payload);
    if (!isValidToken) {
      throw new AppError(
        'Token has been invalidated or expired',
        HttpStatus.UNAUTHORIZED,
        ERROR_CODES.INVALID_ACCESS_TOKEN,
      );
    }

    // Return user object to be injected into request
    return {
      id: user.id,
      username: user.username,
    };
  }
}

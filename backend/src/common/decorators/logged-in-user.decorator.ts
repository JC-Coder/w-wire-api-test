import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '../../module/database/entities/user.entity';

export const LoggedInUserDecorator = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);

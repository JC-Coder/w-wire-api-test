import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { ResponseMessageKey } from '../decorators/response.decorator';
import { Response } from 'express';

export interface IResponse<T> {
  data: T;
}

@Injectable()
export class ResponseTransformerInterceptor<T>
  implements NestInterceptor<T, IResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    const response: Response = context.switchToHttp().getResponse();
    const responseMessage =
      this.reflector.get<string>(ResponseMessageKey, context.getHandler()) ??
      null;

    return next.handle().pipe(
      map((data) => {
        return {
          success: response.statusCode === 201 || response.statusCode === 200,
          data: data,
          message: responseMessage || 'Success',
        };
      }),
    );
  }
}

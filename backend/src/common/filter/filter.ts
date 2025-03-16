import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ERROR_CODES } from 'src/common/constants/error-codes.constant';
import { AppError } from 'src/common/filter/app-error.filter';

interface IResponseMsg {
  statusCode: number;
  message: string[] | string;
  error: string;
}

interface IErrorResponse {
  errorCode: string;
  message: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    let message = exception.message;
    let errorCode: string | undefined;

    const responseMsg: IResponseMsg = exception.getResponse() as IResponseMsg;

    if (exception instanceof AppError) {
      const exceptionResponse = exception.getResponse() as IErrorResponse;

      errorCode = exceptionResponse.errorCode;
      message = exceptionResponse.message;
    }

    // if error code is not set, set it based on the status code
    if (!errorCode) {
      switch (status) {
        case 400:
          errorCode = ERROR_CODES.BAD_REQUEST;
          break;
        case 401:
          errorCode = ERROR_CODES.UNAUTHORIZED;
          break;
        case 403:
          errorCode = ERROR_CODES.FORBIDDEN;
          break;
        case 404:
          errorCode = ERROR_CODES.NOT_FOUND;
          break;
        case 409:
          errorCode = ERROR_CODES.CONFLICT;
          break;
        case 500:
          errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
          break;
        case 503:
          errorCode = ERROR_CODES.SERVICE_UNAVAILABLE;
          break;
        default:
          errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
          break;
      }
    }

    response.status(status).json({
      success: false,
      data: exception.getResponse(),
      message: Array.isArray(responseMsg.message)
        ? responseMsg.message[0]
        : message,
      ...(errorCode || status === HttpStatus.INTERNAL_SERVER_ERROR
        ? { errorCode }
        : {}),
    });
  }
}

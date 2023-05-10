import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseService } from '../service/response.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(protected readonly response: ResponseService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as Record<string, any>).message ??
          JSON.stringify(exceptionResponse);

    response
      .status(200)
      .json(
        this.response.error(
          typeof message === 'string' ? message : JSON.stringify(message),
          500,
        ),
      );
  }
}

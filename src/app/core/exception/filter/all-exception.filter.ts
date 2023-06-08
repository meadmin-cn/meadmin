import { formatToString } from '@/helpers/format';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ResponseService } from '../../service/response.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    protected readonly httpAdapterHost: HttpAdapterHost,
    protected readonly response: ResponseService,
    protected readonly logService: Logger,
  ) {}

  catch(exception: Error, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    // const httpStatus =
    //   exception instanceof HttpException
    //     ? exception.getStatus()
    //     : HttpStatus.INTERNAL_SERVER_ERROR;

    // const responseBody = {
    //   statusCode: httpStatus,
    //   timestamp: new Date().toISOString(),
    //   path: httpAdapter.getRequestUrl(ctx.getRequest()),
    // };
    let code: 400 | 401 | 500 = 500;
    let message = '出错了，请稍后再试';
    if (exception instanceof HttpException) {
      code = exception.getStatus() === 401 ? 401 : 400;
      message = formatToString(
        (exception.getResponse() as any).message ?? exception.getResponse(),
      );
    } else {
      this.logService.error(exception.message, exception.stack);
    }
    httpAdapter.reply(
      ctx.getResponse(),
      this.response.error(message, code),
      200,
    );
  }
}

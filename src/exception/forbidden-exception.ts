import { HttpException } from '@nestjs/common';
/**
 * 显式的错误异常（业务错误）
 * [ForbiddenException description]
 */
export class ForbiddenException extends HttpException {
  constructor(messgae: string) {
    super(messgae, 400);
  }
}

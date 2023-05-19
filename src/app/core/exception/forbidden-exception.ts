import { HttpException } from '@nestjs/common';
/**
 * 显式的错误异常
 * [ForbiddenException description]
 */
export class ForbiddenException extends HttpException {
  constructor(messgae: string) {
    super(messgae, 400);
  }
}

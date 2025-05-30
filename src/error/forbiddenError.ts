import { HttpStatus, MidwayHttpError } from '@midwayjs/core';

/**
 * 显式的错误异常（业务错误）
 * [ForbiddenException description]
 */
export class ForbiddenError extends MidwayHttpError {
  constructor(messgae: string) {
    super(messgae, HttpStatus.BAD_REQUEST);
  }
}

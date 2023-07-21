import { CodeEnum } from '@/dict/code.enum';
import { HttpException } from '@nestjs/common';

/**
 * 无权限
 * [noAuth description]
 */
export class UnauthorizedException extends HttpException {
  constructor(messgae: string) {
    super(messgae, CodeEnum.Unauthorized);
  }
}

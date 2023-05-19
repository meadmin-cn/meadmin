import { HttpException } from '@nestjs/common';

/**
 * 无权限
 * [noAuth description]
 */
export class noAuth extends HttpException {
  constructor(messgae: string) {
    super(messgae, 401);
  }
}

import { Controller, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  success(data: any, msg = '操作成功') {
    return { code: '200', data, msg };
  }

  // code 401 代表token失效
  fail(msg = '操作失败', code = '500', data: any = null) {
    return { code, data, msg };
  }
}

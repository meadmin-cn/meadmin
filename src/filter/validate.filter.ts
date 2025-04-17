import { Catch } from '@midwayjs/core';
import { MidwayValidationError } from '@midwayjs/validate';
import { Context } from '@midwayjs/koa';
import { ResponseService } from '@/service/response.service.js';
import { CodeEunm } from '@/dict/code.enum.js';

@Catch(MidwayValidationError)
export class ValidateErrorFilter {
  protected resposes: ResponseService;
  constructor() {
    this.resposes = new ResponseService();
  }

  async catch(err: MidwayValidationError, ctx: Context) {
    return this.resposes.error(
      '校验参数错误:' + err.message,
      CodeEunm.ValidateFail
    );
  }
}

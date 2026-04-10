import { CodeEunm } from '@/dict/code.enum.js';
import { extractBracesContent } from '@/helper/utils.js';
import { ResponseService } from '@/service/response.service.js';
import { Context } from '@midwayjs/core';
import { Catch } from '@midwayjs/core';
import { MidwayI18nService } from '@midwayjs/i18n';
import { MidwayValidationError } from '@midwayjs/validate';

@Catch(MidwayValidationError)
export class ValidateErrorFilter {
  protected resposes: ResponseService;
  constructor() {
    this.resposes = new ResponseService();
  }

  async catch(err: MidwayValidationError, ctx: Context) {
    const args = {} as Record<string, string>;
    const i18n = await ctx.requestContext.getAsync(MidwayI18nService);
    extractBracesContent(err.message).forEach((v) => {
      args[v] = i18n.translate(v);
    });
    return this.resposes.error(i18n.translate('参数校验错误:') + i18n.translate(err.message, { args }), CodeEunm.ValidateFail);
  }
}

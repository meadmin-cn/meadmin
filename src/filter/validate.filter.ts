import { Catch, Context } from '@midwayjs/core';
import { MidwayValidationError } from '@midwayjs/validate';
import { ResponseService } from '@/service/response.service.js';
import { CodeEunm } from '@/dict/code.enum.js';
import { extractBracesContent } from '@/helper/utils.js';
import { I18nService } from '@/service/i18n.service.js';



@Catch(MidwayValidationError)
export class ValidateErrorFilter {
  protected resposes: ResponseService;
  constructor() {
    this.resposes = new ResponseService();
  }

  async catch(err: MidwayValidationError, ctx: Context) {
    const args = {} as Record<string,string>;
    const i18n = await ctx.requestContext.getAsync(I18nService);
    extractBracesContent(err.message).forEach(v=>{
      args[v] = i18n.translate(v);
    })
    return this.resposes.error(i18n.translate('参数校验错误:') + i18n.translate(err.message,{args}), CodeEunm.ValidateFail);
  }
}

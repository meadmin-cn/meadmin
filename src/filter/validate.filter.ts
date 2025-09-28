import { Catch, Inject } from '@midwayjs/core';
import { MidwayValidationError } from '@midwayjs/validate';
import { ResponseService } from '@/service/response.service.js';
import { CodeEunm } from '@/dict/code.enum.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { extractBracesContent } from '@/helper/utils.js';

@Catch(MidwayValidationError)
export class ValidateErrorFilter {
  protected resposes: ResponseService;
  constructor() {
    this.resposes = new ResponseService();
  }

  
  @Inject()
  i18nService: MidwayI18nService;

  async catch(err: MidwayValidationError) {
    const args = {} as Record<string,string>;
    extractBracesContent(err.message).forEach(v=>{
      args[v] = this.i18nService.translate(v)
    })
    return this.resposes.error(this.i18nService.translate('校验参数错误:') + this.i18nService.translate(err.message,{args}), CodeEunm.ValidateFail);
  }
}

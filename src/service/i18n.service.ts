import { Inject, Provide } from '@midwayjs/core';
import { MidwayI18nService } from '@midwayjs/i18n';

@Provide()
export class I18nService {
  @Inject()
  iI18nService: MidwayI18nService;

  public translate(...arg:Parameters<MidwayI18nService['translate']>){
    return this.iI18nService.translate(...arg) || arg[0];
  }
}
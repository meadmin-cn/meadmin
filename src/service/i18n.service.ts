import { Inject, Provide } from '@midwayjs/core';
import { MidwayI18nService } from '@midwayjs/i18n';
import { formatWithArray, formatWithObject } from '@midwayjs/i18n/dist/utils.js';

@Provide()
export class I18nService {
  @Inject()
  iI18nService: MidwayI18nService;

  public translate(...arg: Parameters<MidwayI18nService['translate']>) {
    return this.iI18nService.translate(...arg) || formatText(arg[0], arg[1]?.args || []);
  }
}

function formatText(message, args) {
  if (Array.isArray(args)) {
    return formatWithArray(message, args);
  } else {
    return formatWithObject(message, args);
  }
}

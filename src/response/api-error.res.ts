import { CodeEnum } from '@/dict/code.enum';
import { ApiBaseRes } from './api-base.res';

/**
 * Err响应类
 */
export class ApiErrorRes extends ApiBaseRes {
  code: Exclude<CodeEnum, CodeEnum.Success>;
}

import { CodeEunm } from '@/dict/code.enum.js';
import { ApiErrorRes } from '@/response/apiError.res.js';
import { ApiPageRes } from '@/response/apiPage.res.js';
import { ApiSuccessRes } from '@/response/apiSuccess.res.js';
import { Provide } from '@midwayjs/core';

@Provide()
// @Scope(ScopeEnum.Singleton)
export class ResponseService {
  /**
   * 格式化返回函数
   * @param code
   * @param message
   * @param data
   * @returns
   */
  private response<C extends CodeEunm, T = any>(code: C, message: string, data: T) {
    return {
      code,
      msg: message,
      data,
    };
  }

  /**
   * 成功返回
   * @param data
   * @param message
   * @returns
   */
  public success<T extends Record<string, any>>(data: T = {} as T, message: string): ApiSuccessRes<T> {
    return this.response(CodeEunm.Success, message, data);
  }

  /**
   * 失败返回
   * @param message
   * @param code
   * @returns
   */
  public error(message: string, code: Exclude<CodeEunm, CodeEunm.Success>): ApiErrorRes {
    return this.response(code, message, undefined);
  }

  /**
   * 分页返回
   * @param list
   * @param total
   * @param page
   * @param size
   * @param message
   * @returns
   */
  public successPage<T = any>(list: T[], total: number, page: number, size: number, message: string): ApiPageRes<T> {
    return this.success(
      {
        page,
        size,
        total,
        list,
      },
      message,
    );
  }
}

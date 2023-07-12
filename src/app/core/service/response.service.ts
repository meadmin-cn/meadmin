import { CodeEnum } from '@/dict/code.enum';
import { ApiErrorRes } from '@/response/api-error.res';
import { ApiPageRes } from '@/response/api-page.res';
import { ApiSuccessRes } from '@/response/api-success.res';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
  /**
   * 格式化返回函数
   * @param code
   * @param message
   * @param data
   * @returns
   */
  private response<C extends CodeEnum, T = any>(
    code: C,
    message: string,
    data: T,
  ) {
    return {
      code,
      message,
      data,
    };
  }

  /**
   * 成功
   * @param data
   * @param message
   * @returns
   */
  public success<T = Record<string, never>>(
    data: T = {} as T,
    message = '操作成功',
  ): ApiSuccessRes<T> {
    return this.response(CodeEnum.Success, message, data);
  }

  /**
   * 失败返回
   * @param message
   * @param code
   * @returns
   */
  public error(
    message: string,
    code: ApiErrorRes['code'] = CodeEnum.Fail,
  ): ApiErrorRes {
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
  public pageRes<T = any>(
    list: T[],
    total = 0,
    page = 1,
    size = 10,
    message = '获取列表成功',
  ): ApiPageRes<T> {
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

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
  private response(
    code: 200 | 401 | 500,
    message: string,
    data: Record<string, any> | null,
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
  public success(data: Record<string, any> = {}, message = '操作成功') {
    return this.response(200, message, data);
  }

  /**
   * 失败返回
   * @param message
   * @param code 401登录异常需要退出重登，500出错
   * @returns
   */
  public error(message: string, code: 401 | 500 = 500) {
    return this.response(code, message, null);
  }
}

import { Catch, Config } from '@midwayjs/core';

@Catch()
export class DefaultErrorFilter {
  @Config('debug')
  debug?:boolean;
  async catch(err: Error) {
    // 所有的未分类错误会到这里
    return {
      code: 500,
      message: this.debug?err.message:'未知异常请联系管理员',
    };
  }
}

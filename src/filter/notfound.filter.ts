import { Catch, httpError } from '@midwayjs/core';

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch() {
    // 404 错误会到这里
    // ctx.redirect('/404.html');
    return '404';
  }
}

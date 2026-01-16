import type { SystemAdmin } from '@/entities/systemAdmin.entity.ts';
import type { User } from '@/entities/user.entity.ts';
// 下面这段只 @midwayjs/koa 的 Context 做扩展
import '@midwayjs/koa';
declare module '@midwayjs/koa' {
  export interface Context {
    //管理员信息，只有没跳过登录校验的admin接口才能拿到
    adminInfo?: SystemAdmin;
    //用户信息，只有传token才能拿到
    userInfo?: User;
  }
}

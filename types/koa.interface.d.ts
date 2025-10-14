import { SystemAdmin } from '@/entities/systemAdmin.entity.ts';
// 下面这段只 @midwayjs/koa 的 Context 做扩展

declare module '@midwayjs/koa' {
  interface Context {
    //管理员信息，只有没跳过登录校验的admin接口才能拿到
    adminInfo: SystemAdmin;
  }
}

//所有 **显式导出的代码 **才会被依赖注入容器加载，简单来说，所有 被装饰器装饰 的类都需要导出，包括控制器，服务，中间件等等
import { Context, Application } from '@midwayjs/koa';
export { MeadminConfiguration as Configuration } from './configuration.js';
0;

export * from './service/router.service.js';
export * from './middleware/globale.middleware.js';
export let ctx: null | Context = null;
export const setCtx = (context: Context) => {
  ctx = context;
};
export let app: null | Application = null;
export const setApp = (application: Application) => {
  app = application;
};

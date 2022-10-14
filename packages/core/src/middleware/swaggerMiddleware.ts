import { Config, IMiddleware, Inject, Middleware } from '@midwayjs/core';
import { SwaggerExplorer } from '@midwayjs/swagger';
import { NextFunction, Context } from '@midwayjs/koa';
import { MeadminConfig } from '../interfaces';
import { cloneDeep, uniq } from 'lodash';

@Middleware()
export class SwaggerMiddleware implements IMiddleware<Context, NextFunction> {
  @Config('meadmin')
  meadminConfig: MeadminConfig;

  @Inject()
  private swaggerExplorer: SwaggerExplorer;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const pathname = ctx.path;
      console.log(pathname, this.meadminConfig);
      if (pathname.indexOf(this.meadminConfig.swagger.path) === -1) {
        return await next();
      }
      const arr = pathname.split('/');
      const lastName = arr.pop();
      if (lastName.endsWith('.json')) {
        const module = lastName.slice(0, -5);
        console.log(module);
        const moduleConfig = this.meadminConfig.swagger.module[module];
        if (moduleConfig) {
          const swaggerData = cloneDeep(this.swaggerExplorer.getData());
          swaggerData.tags = uniq(swaggerData.tags);
        }
      }

      if (lastName === 'index.json') {
        return this.swaggerExplorer.getData();
      }
    };
  }

  static getName() {
    return '@meadmin/core-swagger';
  }
}

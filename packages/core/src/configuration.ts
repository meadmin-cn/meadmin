import { SwaggerMiddleware } from './middleware/swaggerMiddleware';
import { Inject, App } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import * as defaultConfig from './config/config.default';
import { RouterService } from './service/router.service';
import * as koa from '@midwayjs/koa';
import * as swagger from '@midwayjs/swagger';
@Configuration({
  namespace: 'meadmin',
  importConfigs: [
    {
      default: defaultConfig,
    },
  ],
  imports: [koa, swagger],
})
export class MeadminConfiguration {
  @App()
  app: koa.Application;

  @Inject()
  routerService: RouterService;
  onConfigLoad() {
    this.routerService.initControllerOption();
  }
  async onReady() {
    this.app.useMiddleware(SwaggerMiddleware);
    // this.app.getMiddleware().remove(swagger.SwaggerMiddleware)
  }
}

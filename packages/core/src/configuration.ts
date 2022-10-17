import { Inject, App } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import { RouterService } from './service/router.service';
import * as koa from '@midwayjs/koa';
@Configuration({
  namespace: 'meadmin',
  imports: [koa],
})
export class MeadminConfiguration {
  @App()
  app: koa.Application;

  @Inject()
  routerService: RouterService;
  onConfigLoad() {
    this.routerService.initControllerOption();
  }
  async onReady() {}
}

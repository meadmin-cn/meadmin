import { App, Configuration, Inject } from '@midwayjs/core';
import { RouterService } from './service/router.service.js';
import * as koa from '@midwayjs/koa';
import { GlobaleMiddleware } from './middleware/globale.middleware.js';
import { setApp } from './index.js';

@Configuration({
  namespace: 'meadmin',
})
export class MeadminConfiguration {
  @Inject()
  routerService: RouterService;

  @App()
  app: koa.Application;

  // onConfigLoad(){
  //   this.routerService.initControllerOption();
  // }
  async onReady() {
    // TODO something1
    setApp(this.app);
    this.routerService.initControllerOption();
    this.app.useMiddleware(GlobaleMiddleware);

  }
}

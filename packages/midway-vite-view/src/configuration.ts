import { ViteMiddleware } from './middware/vite.middware.js';
import { Configuration, Inject, App, Config } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default.js';
import * as view from '@midwayjs/view';
import { ViteView } from './lib/view.js';
import * as koa from '@midwayjs/koa';
import * as staticFile from '@midwayjs/static-file';
import { ViteViewConfig } from './interface.js';
import { ViteService } from './service/vite.service.js';

@Configuration({
  namespace: 'viteView',
  imports: [view, staticFile],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class MidwayViteViewConfiguration {
  @Inject()
  viewManager: view.ViewManager;

  @App()
  app: koa.Application;

  @Config('viteView')
  viteViewConfig: ViteViewConfig;

  @Inject()
  viteService: ViteService;

  async onReady() {
    if (
      this.viteViewConfig.prod === false ||
      !['prod', 'production'].includes(this.app.getEnv())
    ) {
      this.app.useMiddleware(ViteMiddleware);
      this.viteService.restoreVite();
    }
    this.viewManager.use('viteView', ViteView);
  }

  async onStop(){
    this.viteService.catchViteAddress();
  }
}

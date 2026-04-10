import { App, Config, Configuration, Inject } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as staticFile from '@midwayjs/static-file';
import * as view from '@midwayjs/view';
import * as DefaultConfig from './config/config.default.js';
import { ViteViewConfig } from './interface.js';
import { ViteView } from './lib/view.js';
import { ViteMiddleware } from './middware/vite.middware.js';
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
    }
    this.viewManager.use('viteView', ViteView);
  }
  async onServerReady() {
    if (
      this.viteViewConfig.prod === false ||
      !['prod', 'production'].includes(this.app.getEnv())
    ) {
      this.viteService.getViteMiddlewareArr().catch((err) => {
        console.error('vite服务启动失败', err);
      });
    }
  }

  async onStop() {
    this.viteService.closeAll();
  }
}

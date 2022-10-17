import {
  Configuration,
  Inject,
  MidwayApplicationManager,
  MidwayConfigService,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { SwaggerMiddleware } from './middleware/swagger.middleware';
import * as swagger from '@midwayjs/swagger';

@Configuration({
  namespace: 'meSwagger',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
  imports: [swagger],
})
export class MeSwaggerConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  @Inject()
  configService: MidwayConfigService;

  async onReady() {
    const apps = this.applicationManager.getApplications([
      'express',
      'koa',
      'egg',
      'faas',
    ]);
    if (apps.length) {
      apps.forEach(app => {
        app.useMiddleware(SwaggerMiddleware);
      });
    }
  }
}

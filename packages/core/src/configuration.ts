import { Inject } from '@midwayjs/core';
import { Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { RouterService } from './service/router.service';

@Configuration({
  namespace: 'meadmin',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class MeadminConfiguration {
  @Inject()
  routerService: RouterService;
  onConfigLoad(){
    this.routerService.initControllerOption();
  }
  async onReady() {
    // TODO something
  }
}

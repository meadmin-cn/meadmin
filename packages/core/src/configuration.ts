import { Configuration,  Inject } from '@midwayjs/core';
import { RouterService } from './service/router.service.js';

@Configuration({
  namespace: 'meadmin', 
})
export class MeadminConfiguration {
  @Inject()
  routerService:RouterService;
  
  // onConfigLoad(){
  //   this.routerService.initControllerOption();
  // }
  async onReady() {
    // TODO something1
    this.routerService.initControllerOption();

  }
}

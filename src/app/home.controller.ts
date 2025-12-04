import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;
  
  @Get('*')
  async home() {
    if(this.ctx.originalUrl.startsWith(process.env.VIEW_ADMIN_PATH_PRE+'/') || this.ctx.originalUrl===process.env.VIEW_ADMIN_PATH_PRE){
      await this.ctx.render('admin/index.html');
    }
    // return this.ctx.render('index/index.html');
  }
}

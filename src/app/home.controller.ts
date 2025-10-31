import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;
  
  @Get('*')
  async home() {
    if(this.ctx.originalUrl.startsWith('/admin/') || this.ctx.originalUrl==='/admin'){
      await this.ctx.render('admin/index.html');
    }
    // return this.ctx.render('index/index.html');
  }
}

import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;
  
  @Get('*')
  async home() {
        console.log(333);

    if(this.ctx.originalUrl.startsWith(process.env.VIEW_ADMIN_PATH_PRE+'/'.replaceAll('//','/')) || this.ctx.originalUrl===process.env.VIEW_ADMIN_PATH_PRE){
      return await this.ctx.render('admin/index.html');
    }
    console.log(111);
    if(this.ctx.originalUrl.startsWith(process.env.VIEW_INDEX_PATH_PRE+'/'.replaceAll('//','/')) || this.ctx.originalUrl===process.env.VIEW_INDEX_PATH_PRE){
          console.log(222);

      return await this.ctx.render('index/index.html');
    }
    return '404 not found';
  }
}

import { Controller, Get } from '@midwayjs/core';

@Controller('/admin')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayj12s!';
  }
}

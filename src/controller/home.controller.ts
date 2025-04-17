import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home(): Promise<string> {
    throw new Error('111');
    return 'Hello Midwayj12s!';
  }
}

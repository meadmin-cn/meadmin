import { Controller, Get } from '@midwayjs/core';

@Controller('/book')
export class APIController {
  @Get('/11')
  async getUser() {
    return { success: true, message: 'OK12345' };
  }
}

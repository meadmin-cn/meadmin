import { Catch, httpError } from '@midwayjs/core';
import { ResponseService } from '@/service/response.service.js';
import { CodeEunm } from '@/dict/code.enum.js';

@Catch(httpError.UnauthorizedError)
export class UnauthorizedErrorFilter {
  protected resposes: ResponseService;
  constructor() {
    this.resposes = new ResponseService();
  }

  async catch(err: Error) {
    return this.resposes.error(err.message, CodeEunm.Unauthorized);
  }
}

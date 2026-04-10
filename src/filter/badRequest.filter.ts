import { CodeEunm } from '@/dict/code.enum.js';
import { ResponseService } from '@/service/response.service.js';
import { Catch, httpError } from '@midwayjs/core';

@Catch(httpError.BadRequestError)
export class BadRequestFilter {
  protected resposes: ResponseService;
  constructor() {
    this.resposes = new ResponseService();
  }
  catch(err: Error) {
    return this.resposes.error(err.message, CodeEunm.Fail);
  }
}

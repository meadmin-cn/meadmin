import { Inject, Controller } from '@midwayjs/core';
import { ResponseService } from '@/service/response.service.js';

@Controller('/api')
export abstract class ApiController {
  @Inject()
  protected readonly resposes: ResponseService;
}

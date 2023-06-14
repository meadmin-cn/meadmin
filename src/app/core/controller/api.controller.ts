import { Controller, Inject } from '@nestjs/common';
import { ResponseService } from '../service/response.service';

@Controller('api')
export abstract class ApiController {
  @Inject(ResponseService)
  protected readonly response: ResponseService; //返回值
}

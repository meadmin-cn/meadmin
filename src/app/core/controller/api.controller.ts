import { Controller, Inject, UseFilters } from '@nestjs/common';
import { ResponseService } from '../service/response.service';
import { HttpExceptionFilter } from '../exception/http-exception.filter';

@Controller('api')
@UseFilters(HttpExceptionFilter)
export abstract class ApiController {
  @Inject(ResponseService)
  protected readonly response: ResponseService; //返回值
}

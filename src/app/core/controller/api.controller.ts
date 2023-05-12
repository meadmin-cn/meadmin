import { Inject, UseFilters } from '@nestjs/common';
import { ResponseService } from '../service/response.service';
import { HttpExceptionFilter } from '../exception/http-exception.filter';

@UseFilters(HttpExceptionFilter)
export abstract class ApiController {
  @Inject(ResponseService)
  protected readonly response: ResponseService; //返回值
}

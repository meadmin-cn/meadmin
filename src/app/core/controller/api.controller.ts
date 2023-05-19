import { Controller, Inject, UseFilters } from '@nestjs/common';
import { ResponseService } from '../service/response.service';
import { AllExceptionsFilter } from '../exception/all-exception.filter';

@Controller('api')
@UseFilters(AllExceptionsFilter)
export abstract class ApiController {
  @Inject(ResponseService)
  protected readonly response: ResponseService; //返回值
}

import { ApiController } from '@/app/core/controller/api.controller';
import { Controller } from '@nestjs/common';

@Controller('admin')
export abstract class AdminApiController extends ApiController {}

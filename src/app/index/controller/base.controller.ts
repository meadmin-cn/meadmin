import { Controller } from '@midwayjs/core';
import { ApiController } from '@/controller/api.controller.js';

@Controller('index')
export abstract class BaseController extends ApiController {}
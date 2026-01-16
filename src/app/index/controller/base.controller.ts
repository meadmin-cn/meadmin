import { ApiController } from '@/controller/api.controller.js';
import { Controller } from '@midwayjs/core';
import { IndexMiddleware } from '../middleware/index.middleware.js';

@Controller('index', { middleware: [IndexMiddleware] })
export abstract class BaseController extends ApiController {}

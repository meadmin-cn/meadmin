import { Controller } from '@midwayjs/core';
import { ApiController } from '@/controller/api.controller.js';
import { AdminMiddleware } from '../middleware/admin.middleware.js';

@Controller('admin', { middleware: [AdminMiddleware] })
export abstract class BaseController extends ApiController {}

import { Controller } from '@midwayjs/core';
import { ApiController } from '@/controller/api.controller.js';
import { AdminMiddle } from '../middleware/adminMiddleware.js';

@Controller('admin', { middleware: [AdminMiddle] })
export abstract class BaseController extends ApiController {}

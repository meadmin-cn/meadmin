import { Controller } from '@midwayjs/core';
import { APIController } from '../api.controller';

@Controller('/admin')
export class BaseController extends APIController {}

//自动生成，不可更改
import { registerAs } from '@nestjs/config';
import app from './app';
import database from './database';
import log from './log';
import swagger from './swagger';
import validator from './validator';
//import code

export default [
  registerAs('app.ts'.replace('.ts', '').replace(/\//g, '.'), app),
  registerAs('database.ts'.replace('.ts', '').replace(/\//g, '.'), database),
  registerAs('log.ts'.replace('.ts', '').replace(/\//g, '.'), log),
  registerAs('swagger.ts'.replace('.ts', '').replace(/\//g, '.'), swagger),
  registerAs('validator.ts'.replace('.ts', '').replace(/\//g, '.'), validator),
  //register code
];

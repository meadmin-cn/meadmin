//自动生成，不可更改
import { registerAs } from '@nestjs/config';
import app from './app';
import database from './database';
import validator from './validator';
//import code

export default [
  registerAs('app.ts'.replace('.ts', '').replace(/\//g, '.'), app),
  registerAs('database.ts'.replace('.ts', '').replace(/\//g, '.'), database),
  registerAs('validator.ts'.replace('.ts', '').replace(/\//g, '.'), validator),
  //register code
];

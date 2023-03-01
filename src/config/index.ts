//自动生成，不可更改
import { registerAs } from '@nestjs/config';
import app from './app';
import admin from './admin/index';
//import code

export default [
  registerAs('app.ts'.replace('.ts', '').replace(/\//g, '.'), app),
  registerAs('admin/index.ts'.replace('.ts', '').replace(/\//g, '.'), admin),
  //register code
];

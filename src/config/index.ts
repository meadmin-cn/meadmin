//自动生成，不可更改
import { registerAs } from '@nestjs/config';
import app from './app';
//import code

export default [
  registerAs('app.ts'.replace('.ts', '').replace(/\//g, '.'), app),
  //register code
];

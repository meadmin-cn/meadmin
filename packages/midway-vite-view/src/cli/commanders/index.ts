import { Command } from 'commander';
import { buildInit } from './build.js';
export const init = (program:Command)=>{
  buildInit(program);
}
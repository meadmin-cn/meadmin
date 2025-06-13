import { Command } from 'commander';
import { crudInit } from './crud.js';
import { syncInit } from './sync.js';
export const init = (program:Command)=>{
    syncInit(program);
    crudInit(program);
}
import { Command } from 'commander';
import { setEnv } from '../utils/env.js';
import { crudInit } from './crud.js';
import { syncInit } from './sync.js';
export const init = (program: Command) => {
  program.option('-m <char>', 'env环境变量').hook('preAction', (thisCommand) => {
    setEnv(thisCommand.opts().m);
  });
  syncInit(program);
  crudInit(program);
};

import { Command } from 'commander';
import { setEnv } from '../utils/env.js';
import { addonInit } from './addon.js';
import { crudInit } from './crud.js';
import { syncInit } from './sync.js';
import { compressInit } from './compress.js';
export const init = (program: Command) => {
  program.option('-m <char>', 'env环境变量').hook('preAction', (thisCommand) => {
    setEnv(thisCommand.opts().m);
  });
  syncInit(program);
  crudInit(program);
  addonInit(program);
  compressInit(program);
};

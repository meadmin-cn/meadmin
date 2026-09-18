import { Command } from 'commander';
import { setEnv } from '../utils/env.js';
import { addonInit } from './addon.js';
import { compressInit } from './compress.js';
import { crudInit } from './crud.js';
import { syncInit } from './sync.js';
import { updateInit } from './update.js';
export const init = (program: Command) => {
  program.option('-m <char>', 'env环境变量').hook('preAction', (thisCommand, actionCommand) => {
    setEnv(actionCommand.opts().m ?? thisCommand.opts().m);
  });
  syncInit(program);
  crudInit(program);
  addonInit(program);
  compressInit(program);
  updateInit(program);
  // 位置选项使 update --version 不再被根命令截获，同时兼容子命令后的 -m。
  for (const command of program.commands) command.option('-m <char>', 'env环境变量');
};

import { Command } from 'commander';
import {init} from './commanders/index.js';
import { readFileSync } from 'node:fs';
const program = new Command();
const { version } = JSON.parse(
  readFileSync(import.meta.dirname + '/../../package.json').toString(),
);
program
  .name('meadmin')
  .description('CLI of MEADMIN')
  .version(version);
init(program);
program.parse();

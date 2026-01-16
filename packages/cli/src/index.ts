import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { init } from './commanders/index.js';

const program = new Command();
const { version } = JSON.parse(readFileSync(import.meta.dirname + '/../package.json').toString());
program.name('meadmin').description('CLI of MEADMIN').version(version);
init(program);
program.parse();

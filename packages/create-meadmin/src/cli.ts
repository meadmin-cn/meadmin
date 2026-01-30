import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { init } from './commanders/index.js';

const program = new Command();
const { version } = JSON.parse(readFileSync(import.meta.dirname + '/../package.json').toString());
program.name('createMeadmin').description('CLI of CreateMeadmin').version(version);
init(program);
program.parse();

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import {init} from './commanders/index.js';
import dotenv from 'dotenv';
// 根据当前环境加载不同的 .env 文件
if (process.env.NODE_ENV) {
  dotenv.config({
    path: ['.env', `.env.${process.env.NODE_ENV}`],
    override: true,
  });
} else {
  dotenv.config({
    path: ['.env'],
    override: true,
  });
}
const program = new Command();
const { version } = JSON.parse(
  readFileSync(import.meta.dirname + '/../package.json').toString(),
);
program
  .name('meadmin')
  .description('CLI of MEADMIN')
  .version(version);
init(program);
program.parse();

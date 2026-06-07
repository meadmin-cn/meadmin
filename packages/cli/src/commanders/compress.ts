import { Command } from 'commander';
import dayjs from 'dayjs';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { copyFile, copyPath } from '../utils/file.js';
const copyFiles = {
  './.env':{},
  './.npmrc':{},
  './bootstrap.js':{},
  './package.json':{},
  './pnpm-lock.yaml':{},
  './pnpm-workspace.yaml':{},
  './dist/':{},
  './logs/':{},
  './public/':{},
  './uploadFile/':{},
  './view/admin/dist/':{},
  './view/index/dist/':{},
  './view/admin/package.json':{},
  './view/index/package.json':{},
  './addons/':{
    ignore:[/.*\/node_modules/],
  }
}as Record<
  string,
  {
    ignore?: Array<string | RegExp>; //会递归应用忽略
    fileSetFunction?: Record<string, (content: string) => string>;//会重新设置内容
  }
>;
export const compressInit = (program: Command) => {
  program
  .command('compress')
  .description('压缩部署文件')
  .option('-c, --config <char>', '配置文件')
  .action(async (options:{config:string}) => {
    console.log('---',options);
    const name = 'dist_'+dayjs().format('YYYYMMDDHHmmss')
    const fromPath = process.cwd();
    const toPath = process.cwd()+'/'+name ;
    mkdirSync(toPath);
    await Promise.all(
      Object.keys(copyFiles).map(async (key) => {
        if (key.endsWith('/')) {
          await copyPath(resolve(fromPath, key), resolve(toPath, key), '', copyFiles[key].ignore || [], copyFiles[key].fileSetFunction, false);
        } else {
          await copyFile(resolve(fromPath, key), resolve(toPath, key), typeof copyFiles[key] === 'function' ? copyFiles[key] : undefined, false);
        }
      }),
    );
  });
}
import { Command } from 'commander';
import dayjs from 'dayjs';
import { mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { copyFile, copyPath, zipFolderAsyncOptimized } from '../utils/file.js';
import { Log } from '../utils/log.js';
export const compressInit = (program: Command) => {
  program
    .command('compress')
    .description('归档部署文件')
    .option('-c, --config <char>', '配置文件', 'compose.config.js')
    .action(async (options: { config: string }) => {
      const copyFiles = (await import(pathToFileURL(resolve(process.cwd(), options.config)).href)).default;
      const name = 'dist_' + dayjs().format('YYYYMMDDHHmmss');
      const fromPath = process.cwd();
      const toPath = process.cwd() + '/' + name;
      mkdirSync(toPath);
      Log.log('正在从源文件夹复制文件到临时文件夹:' + toPath);
      await Promise.all(
        Object.keys(copyFiles).map(async (key) => {
          if (key.endsWith('/')) {
            await copyPath(resolve(fromPath, key), resolve(toPath, key), '', copyFiles[key].ignore || [], copyFiles[key].fileSetFunction, false);
          } else {
            await copyFile(resolve(fromPath, key), resolve(toPath, key), typeof copyFiles[key] === 'function' ? copyFiles[key] : undefined, false);
          }
        }),
      );

      Log.log('正在生成压缩文件....');
      await zipFolderAsyncOptimized(toPath, toPath + '.zip');
      rmSync(toPath, { recursive: true, force: true });
      Log.success('部署文件归档完成，文件地址为：' + toPath + '.zip ');
    });
};

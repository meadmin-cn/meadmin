import { Command } from 'commander';
import dayjs from 'dayjs';
import { lstat, mkdtemp, realpath, rm } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep, win32 } from 'node:path';
import { pathToFileURL } from 'node:url';
import { copyFile, copyPath, zipFolderAsyncOptimized } from '../utils/file.js';
import { Log } from '../utils/log.js';

type FileTransform = (content: string) => string | Promise<string>;
type CopyFiles = Record<string, FileTransform | { ignore?: Array<string | RegExp>; fileSetFunction?: Record<string, FileTransform> }>;

export const compressInit = (program: Command) => {
  program
    .command('compress')
    .description('归档部署文件')
    .option('-c, --config <char>', '配置文件', 'compose.config.js')
    .action(async (options: { config: string }) => {
      const copyFiles = (await import(pathToFileURL(resolve(process.cwd(), options.config)).href)).default as CopyFiles;
      const fromPath = await realpath(process.cwd());
      // 配置路径同时用于读取与归档，禁止绝对路径、父目录及 Windows 盘符/ADS。
      const paths = Object.keys(copyFiles).map((key) => {
        const path = key.replaceAll('\\', '/');
        if (!path || isAbsolute(path) || win32.isAbsolute(path) || path.includes(':') || path.includes('\0') || path.split('/').includes('..') || path.split('/').every((part) => !part || part === '.')) {
          throw new Error(`compress 只允许项目内的相对路径: ${key}`);
        }
        return { key, path };
      });
      const toPath = await mkdtemp(join(fromPath, 'dist_' + dayjs().format('YYYYMMDDHHmmss') + '-'));
      const outputPath = toPath + '.zip';
      try {
        Log.log('正在从源文件夹复制文件到临时文件夹:' + toPath);
        for (const { key, path } of paths) {
          const source = resolve(fromPath, path);
          // helper 保留缺失文件时跳过的旧行为；compress 缺失输入必须报错。
          const stats = await lstat(source);
          const sourceReal = await realpath(source);
          const sourceRelative = relative(fromPath, sourceReal);
          if (sourceRelative === '..' || sourceRelative.startsWith(`..${sep}`) || isAbsolute(sourceRelative)) throw new Error(`compress 源必须位于项目内: ${key}`);
          if (stats.isSymbolicLink()) throw new Error(`compress 源不能是软链接: ${key}`);
          if (path.endsWith('/')) {
            const config = copyFiles[key];
            if (!stats.isDirectory() || typeof config !== 'object' || config === null) throw new Error(`无效的目录配置: ${key}`);
            await copyPath(source, resolve(toPath, path), '', config.ignore || [], config.fileSetFunction, false);
          } else {
            if (!stats.isFile()) throw new Error(`文件路径必须指向普通文件: ${key}`);
            const transform = copyFiles[key];
            await copyFile(source, resolve(toPath, path), typeof transform === 'function' ? transform : undefined, false);
          }
        }
        Log.log('正在生成压缩文件....');
        await zipFolderAsyncOptimized(toPath, outputPath);
      } catch (error) {
        // ZIP 写入器负责清理本次不完整输出；复制结果保留以便排查或重用。
        throw new Error(`归档失败，临时目录已保留：${toPath}`, { cause: error });
      }
      await rm(toPath, { recursive: true, force: true });
      Log.success('部署文件归档完成，文件地址为：' + outputPath + ' ');
    });
};

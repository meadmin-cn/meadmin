//创建meadmin模板
import { Command } from 'commander';
import { mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as prettier from 'prettier';
import { recursionWriteFileSync } from 'src/utils/file.js';

// 需要复制的文件，key为文件路径，文件夹以/结尾，{
//   ignore:忽略文件支持正则或字符串数组
//   fileSetFunction,//单个文件处理函数，key为文件相对于文件夹路径，值为对应函数，content=>str
// },
// key文件路径为单个文件时，允许值为文件处理函数：content=>str
const copyFiles = {
  '.husky/': {
    ignore: ['_'], //忽略的值
    fileSetFunction: {
      //单个文件处理函数，文件内容，content=>str
    },
  },
  '.vscode/': {},
  'src/': {},
  'test/': {},
  'types/': {},
  'view/admin/': {
    ignore: ['node_modules', '.eslintcache'], //忽略的值
  },
  'view/index/': {
    ignore: ['node_modules', '.eslintcache'], //忽略的值
  },
  '.editorconfig': {},
  '.env': (content: string) => {},
  '.eslintrc.json': {},
  '.gitignore': {},
  '.mocharc.json': {},
  '.npmrc': {},
  '.prettierignore': {},
  '.prettierrc.cjs': {},
  'bootstrap.js': {},
  'nx.json': {},
  'package.json': (content: string) => {
    const jsonObj = JSON.parse(content);
    delete jsonObj.devDependencies['release-it'];
    delete jsonObj.devDependencies['@release-it/conventional-changelog'];
    return prettier(content);
  },
  'README.md': {},
  'tsconfig.json': {},
};
//需要创建的文件/文件夹
const makeFiles = {
  'logs/.gitkeep': {},
  'public/admin/': {},
  'public/index/': {},
  'uploadFile/admin/.gitkeep': {},
  'uploadFile/index/.gitkeep': {},
};

const copyFile = (fromFile: string, toFile: string, fileSetFunction?: (content: string) => string) => {
  let content = readFileSync(fromFile, 'utf-8');
  if (fileSetFunction) {
    content = fileSetFunction(content);
  }
  return recursionWriteFileSync(toFile, content);
};

const copyPath = (pathFile, toPath, relativePath = '', ignoreFile = [] as Array<string | RegExp>, fileSetFunctions?: Record<string, (content: string) => string>) => {
  const fileList = readdirSync(pathFile);
  fileList.forEach((file) => {
    const relativeFilePath = join(relativePath, file).replaceAll('\\', '/');
    ignoreFile.forEach((key) => {
      if (key instanceof RegExp) {
        if (key.test(relativeFilePath)) {
          return;
        }
      } else if (key === relativeFilePath) {
        return;
      }
    });
    const path = resolve(pathFile, file);
    const toSetPath = resolve(toPath, file);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      mkdirSync(toSetPath, { recursive: true });
      //文件夹递归处理
      copyPath(path, toSetPath, relativeFilePath, ignoreFile, fileSetFunctions);
    } else {
      if (fileSetFunctions) {
        const files = Object.keys(fileSetFunctions);
        for (let i = 0; i < files.length; i++) {
          if (files[i] === relativeFilePath) {
            return copyFile(path, toSetPath, fileSetFunctions[files[i]]);
          }
        }
      }
      copyFile(path, toSetPath);
    }
  });
};

export const setMeadminTemplate = (program: Command) => {
  program
    .command('setMeadminTemplate')
    .description('生成meadmin模板')
    .argument('<file>', '文件夹名称', 'meadmin')
    .action(async (file: string) => {
      const toPath = resolve(import.meta.dirname, '../', file + '/');
      const fromPath = resolve(process.cwd());
      //创建文件夹或文件
      Object.keys(makeFiles).forEach((key) => {
        const path = resolve(toPath, key);
        if (key.endsWith('/')) {
          mkdirSync(path, { recursive: true });
        } else {
          recursionWriteFileSync(path, '');
        }
      });
      Object.keys(copyFiles).forEach((key) => {
        if (key.endsWith('/')) {
          copyPath(resolve(fromPath, key), resolve(toPath, key), copyFiles[key].ignoreFile || [], copyFiles[key].fileSetFunction);
        }
      });
    });
};

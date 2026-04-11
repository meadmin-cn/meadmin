/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//创建meadmin模板
import { Command } from 'commander';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import * as prettier from 'prettier';
import { copyFile, copyPath, recursionWriteFileSync } from '../utils/file.js';
let fromPath = '';
// 需要复制的文件，key为文件路径，文件夹以/结尾，{
//   ignore:忽略文件支持正则或字符串数组
//   fileSetFunction,//单个文件处理函数，key为文件相对于文件夹路径，值为对应函数，content=>str
// },
// key文件路径为单个文件时，允许值为文件处理函数：content=>str
const copyFiles = {
  '.husky/': {
    ignore: ['_', 'commit-msg'], //忽略的值
    fileSetFunction: {
      //单个文件处理函数，文件内容，content=>str
    },
  },
  '.vscode/': {},
  'src/': {
    ignore: ['index/addons', 'admin/addons'],
  },
  'test/': {},
  'public/admin/': {},
  'public/index/': {},
  'view/admin/': {
    ignore: ['node_modules', '.eslintcache', 'dist', 'src/addons'], //忽略的值
    fileSetFunction: {
      'package.json': async (content: string) => {
        const jsonObj = JSON.parse(content);
        Object.keys(jsonObj.devDependencies).forEach((key) => {
          if (jsonObj.devDependencies[key] === 'workspace:^') {
            const { version } = JSON.parse(readFileSync(resolve(fromPath, 'node_modules/', key + '/package.json')).toString());
            jsonObj.devDependencies[key] = '~' + version;
          }
          if (key.startsWith('meadmin-addons-')) {
            delete jsonObj.devDependencies[key];
          }
        });
        Object.keys(jsonObj.dependencies).forEach((key) => {
          if (jsonObj.dependencies[key] === 'workspace:^') {
            const { version } = JSON.parse(readFileSync(resolve(fromPath, 'node_modules/', key + '/package.json')).toString());
            jsonObj.dependencies[key] = '~' + version;
          }
          if (key.startsWith('meadmin-addons-')) {
            delete jsonObj.dependencies[key];
          }
        });
        return await prettier.format(JSON.stringify(jsonObj), { parser: 'json' });
      },
    },
  },
  'view/index/': {
    ignore: ['node_modules', '.eslintcache', 'dist', 'src/addons'], //忽略的值
    fileSetFunction: {
      'package.json': async (content: string) => {
        const jsonObj = JSON.parse(content);
        Object.keys(jsonObj.devDependencies).forEach((key) => {
          if (jsonObj.devDependencies[key] === 'workspace:^') {
            const { version } = JSON.parse(readFileSync(resolve(fromPath, 'node_modules/', key + '/package.json')).toString());
            jsonObj.devDependencies[key] = '~' + version;
          }
          if (key.startsWith('meadmin-addons-')) {
            delete jsonObj.devDependencies[key];
          }
        });
        Object.keys(jsonObj.dependencies).forEach((key) => {
          if (jsonObj.dependencies[key] === 'workspace:^') {
            const { version } = JSON.parse(readFileSync(resolve(fromPath, 'node_modules/', key + '/package.json')).toString());
            jsonObj.dependencies[key] = '~' + version;
          }
          if (key.startsWith('meadmin-addons-')) {
            delete jsonObj.dependencies[key];
          }
        });
        return await prettier.format(JSON.stringify(jsonObj), { parser: 'json' });
      },
    },
  },
  '.editorconfig': {},
  '.env': {},
  'eslint.config.js': {},
  '.gitignore': {},
  '.mocharc.json': {},
  '.npmignore': {},
  '.npmrc': {},
  '.prettierignore': {},
  '.prettierrc.js': {},
  'bootstrap.js': {},
  'nx.json': {},
  'package.json': async (content: string) => {
    const jsonObj = JSON.parse(content);
    delete jsonObj.devDependencies['release-it'];
    delete jsonObj.devDependencies['@release-it/conventional-changelog'];
    Object.keys(jsonObj.devDependencies).forEach((key) => {
      if (jsonObj.devDependencies[key] === 'workspace:^') {
        const { version } = JSON.parse(readFileSync(resolve(fromPath, 'node_modules/', key + '/package.json')).toString());
        jsonObj.devDependencies[key] = '~' + version;
      }
      if (key.startsWith('meadmin-addons-')) {
        delete jsonObj.devDependencies[key];
      }
    });
    Object.keys(jsonObj.dependencies).forEach((key) => {
      if (jsonObj.dependencies[key] === 'workspace:^') {
        const { version } = JSON.parse(readFileSync(resolve(fromPath, 'node_modules/', key + '/package.json')).toString());
        jsonObj.dependencies[key] = '~' + version;
      }
      if (key.startsWith('meadmin-addons-')) {
        delete jsonObj.dependencies[key];
      }
    });
    return await prettier.format(JSON.stringify(jsonObj), { parser: 'json' });
  },
  'pnpm-workspace.yaml'(content) {
    return prettier.format(content.replace(`- packages/*`, ''), {
      parser: 'yaml',
    });
  },
  'pnpm-lock.yaml': {},
  'README.md': {},
  'README_EN.md': {},
  'tsconfig.json': {},
  'meadmin.sql': {},
};
//需要创建的文件/文件夹
const makeFiles = {
  'logs/.gitkeep': {},
  'uploadFile/admin/.gitkeep': {},
  'uploadFile/index/.gitkeep': {},
  'uploadFile/tmp/.gitkeep': {},
  'view/admin/dist/.gitkeep': {},
  'view/index/dist/.gitkeep': {},
  'addons/.gitkeep': {},
  'src/app/admin/addons/.gitkeep': {},
  'src/app/index/addons/.gitkeep': {},
  'view/admin/src/addons/.gitkeep': {},
  'view/index/src/addons/.gitkeep': {},
};

export const setMeadminTemplate = (program: Command) => {
  program
    .command('setMeadminTemplate')
    .description('生成meadmin模板, （输入模板目录名）')
    .argument('<file>', '文件夹名称')
    .action(async (file: string) => {
      const toPath = resolve(import.meta.dirname, '../template/', file + '/');
      rmSync(toPath, { force: true, recursive: true });
      fromPath = resolve(process.cwd());
      //创建文件夹或文件
      Object.keys(makeFiles).forEach((key) => {
        const path = resolve(toPath, key);
        if (key.endsWith('/')) {
          mkdirSync(path, { recursive: true });
        } else {
          recursionWriteFileSync(path, '');
        }
      });
      await Promise.all(
        Object.keys(copyFiles).map(async (key) => {
          if (key.endsWith('/')) {
            await copyPath(resolve(fromPath, key), resolve(toPath, key), '', copyFiles[key].ignore || [], copyFiles[key].fileSetFunction, true);
          } else {
            await copyFile(resolve(fromPath, key), resolve(toPath, key), typeof copyFiles[key] === 'function' ? copyFiles[key] : undefined, true);
          }
        }),
      );
    });
};

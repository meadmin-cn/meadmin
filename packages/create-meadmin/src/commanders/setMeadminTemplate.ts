//创建meadmin模板
import { Command } from 'commander';
import { resolve } from 'node:path';

const copyFiles = {
  '.husky/': {
    ignore: ['_/'], //忽略的值
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
    fileSetFunction: {
      //单个文件处理函数，文件内容，content=>str
      'package.json': (content: string) => {},
    },
  },
  'view/index/': {
    ignore: ['node_modules', '.eslintcache'], //忽略的值
    fileSetFunction: {
      //单个文件处理函数，文件内容，content=>str
      'package.json': (content: string) => {},
    },
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
  'commitlint.config.cjs': {},
  'nx.json': {},
  'package.json': (content: string) => {},
  'README.md': {},
  'tsconfig.json': {},
};
const makeFiles = {
  'logs/.gitkeep': {},
  'public/admin/': {},
  'public/index/': {},
  'uploadFile/admin/.gitkeep': {},
  'uploadFile/index/.gitkeep': {},
};

export const setMeadminTemplate = (program: Command) => {
  program
    .command('setMeadminTemplate')
    .description('生成meadmin模板')
    .argument('<file>', '文件夹名称', 'meadmin')
    .action(async (file: string) => {
      const toPath = resolve(import.meta.dirname, '../', file);
      const fromPath = resolve(process.cwd());
    });
};

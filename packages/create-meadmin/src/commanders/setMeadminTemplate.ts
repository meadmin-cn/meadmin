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
    //插件源码由 npx meadmin addon <name> 安装，不随模板发布；
    //插件实体统一以 aon 开头（aon_cms_article → aonCmsArticle.entity.ts），一并排除
    ignore: ['app/index/addons', 'app/admin/addons', /^entities\/aon[A-Za-z0-9]+\.entity\.ts$/],
  },
  'test/': {},
  'public/admin/': {},
  'public/index/': {
    //插件演示图片与下载资源由插件安装脚本投放
    ignore: ['images/cms'],
  },
  'view/admin/': {
    ignore: ['node_modules', '.eslintcache', 'dist', 'src/addons'], //忽略的值
    fileSetFunction: {
      //插件组件类型声明由 vite 插件扫描 src/addons 生成，模板里按「无插件」的空骨架重新生成
      'types/addonsComponents.d.ts': () => readFileSync(resolve(fromPath, 'view/admin/template/components.d.ts')).toString(),
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
  'pnpm-workspace.yaml'(content: string) {
    return prettier.format(content.replace(`- packages/*`, ''), {
      parser: 'yaml',
    });
  },
  'pnpm-lock.yaml': {},
  'README.md': {},
  'README_EN.md': {},
  'tsconfig.json': {},
  'meadmin.sql': {},
  'compose.config.js': {},
  'AI-README.md': {},
  'uploadFile/admin/3832e40249f4eb6c4feca1c257718907.png': {},
  'uploadFile/admin/b51e6a53459859d203041f8c0dffcd92.png': {},
  'uploadFile/admin/c99e23ad65db6db5bea03d828fb6166e.png': {},
  'uploadFile/admin/dac00cfc094a2b9acefeb67be311e1f5.png': {},
  'uploadFile/admin/e27aae898e9bd0f8f1706246c1e6f372.png': {},
  'uploadFile/admin/b0faa183985a2a91a49fbdf94091b4cd.png': {},
  'uploadFile/admin/cdfa039cf2cc04b2d9fbfabbb485bd72.png': {},
  'uploadFile/index/c99e23ad65db6db5bea03d828fb6166e.png': {},
  'uploadFile/index/dac00cfc094a2b9acefeb67be311e1f5.png': {},
  'uploadFile/index/b0faa183985a2a91a49fbdf94091b4cd.png': {},
} as Record<
  string,
  {
    ignore?: Array<string | RegExp>;
    fileSetFunction?: Record<string, (content: string) => string | Promise<string>>;
  }
>;
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

/**
 * 生成模板文件：把项目根目录下需要随包发布的文件拷贝到 cli 内置的 template 目录。
 * @param file 模板目录名
 * @param cwd 项目根目录，默认当前执行目录
 */
export const generateTemplate = async (file: string, cwd = process.cwd()) => {
  const toPath = resolve(import.meta.dirname, '../template/', file + '/');
  rmSync(toPath, { force: true, recursive: true });
  fromPath = resolve(cwd);
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
};

export const setMeadminTemplate = (program: Command) => {
  program
    .command('setMeadminTemplate')
    //命令名较长，兼容 setTemplate 简写
    .alias('setTemplate')
    .description('生成meadmin模板, （输入模板目录名）')
    .argument('<file>', '文件夹名称')
    .action(async (file: string) => {
      await generateTemplate(file);
    });
};

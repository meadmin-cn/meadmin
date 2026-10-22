import { importModels } from '@sequelize/core';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Log } from './log.js';

/**
 * 默认数据库配置文件：优先使用未编译的 TS 源码，让 `meadmin sync/crud` 像 vite 读
 * vite.config.ts 一样直接解析 src/config/database.ts，改完实体不用先 build。
 */
export function defaultDbConfig(root = process.cwd()) {
  const source = join(root, 'src/config/database.ts');
  return existsSync(source) ? source : join(root, 'dist/config/database.js');
}

let tsxRegistered = false;

/** 用项目自带的 tsx 在当前进程注册 TS 加载器，返回是否注册成功 */
async function tryRegisterTsx(root: string) {
  if (tsxRegistered) return true;
  try {
    const apiPath = createRequire(join(root, 'package.json')).resolve('tsx/esm/api');
    const { register } = (await import(pathToFileURL(apiPath).href)) as { register: () => unknown };
    register();
    tsxRegistered = true;
    return true;
  } catch {
    return false;
  }
}

/** 实体 glob 的根目录：src/config/database.ts → src、dist/config/database.js → dist */
const configRoot = (dbConfig: string) => resolve(dirname(dbConfig), '..');

/**
 * 源码模式下配置里的实体 glob 通常按编译产物写成 *.entity.js（只有 dist 里才有 .js），
 * 直接用它匹配不到任何模型。这里按同一目录补一次 *.entity.ts。
 */
async function fillSourceModels<T extends { models?: unknown[] }>(config: T, dbConfig: string) {
  if (config.models?.length) return config;
  const models = await importModels(join(configRoot(dbConfig), '**/*.entity.ts').replace(/\\/g, '/'));
  if (models.length) config.models = models;
  return config;
}

export async function getConfig(dbConfig: string, name: string, root = process.cwd()) {
  const isSource = /\.(ts|mts|cts)$/i.test(dbConfig);
  let file = dbConfig;
  if (isSource && !(await tryRegisterTsx(root))) {
    //项目没装 tsx 时退回编译产物，保持原有用法可用
    const fallback = join(root, 'dist/config/database.js');
    if (!existsSync(fallback)) throw new Error(`读取 ${dbConfig} 需要 tsx，但项目里没有安装。请执行 pnpm add -D tsx，或用 -d 指定 dist/config/database.js`);
    Log.warn(`项目未安装 tsx，已改用 ${fallback}`);
    file = fallback;
  }
  const infos = await import(pathToFileURL(file).href);
  const config = await (infos.__esModule ? infos.default : infos).default();
  const configName = name ?? config.defaultDataSourceName ?? 'default';
  const dataSource = config.dataSource[configName];
  if (isSource && file === dbConfig) await fillSourceModels(dataSource, dbConfig);
  return dataSource;
}

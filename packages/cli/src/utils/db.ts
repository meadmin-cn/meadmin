import { importModels } from '@sequelize/core';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Log } from './log.js';

/**
 * 取「项目自己的」@sequelize/core（含 importModels / Sequelize）。
 *
 * 项目实体里的 DataTypes、Model 基类都来自项目 node_modules 的那份副本。用 CLI 自带的副本去
 * `importModels` 或 `new Sequelize`，是两套完全不同的模块实例：前者会把项目模型判成「不是 Model」
 * 而静默过滤成 0 个，后者则报 `normalizing attribute "xxx"` / `Model X has not been initialized`。
 * 版本号相同也照样中招——只要物理路径不同就是两份。
 */
export async function projectCore(root: string): Promise<{ Sequelize: typeof import('@sequelize/core').Sequelize; importModels: typeof importModels }> {
  const own = await import('@sequelize/core');
  try {
    const entry = createRequire(join(root, 'package.json')).resolve('@sequelize/core');
    // 该包的 ESM 命名空间不全：importModels 只在 default 上，Sequelize 才是命名导出，两处都取一遍
    const module = (await import(pathToFileURL(entry).href)) as typeof import('@sequelize/core') & {
      default?: { importModels?: typeof importModels };
    };
    const resolved = module.importModels ?? module.default?.importModels;
    if (!module.Sequelize || !resolved) return { Sequelize: own.Sequelize, importModels: own.importModels };
    return { Sequelize: module.Sequelize, importModels: resolved };
  } catch {
    // 项目里解析不到（例如未提升到根 node_modules）时退回自带的，不比原来更差
    return { Sequelize: own.Sequelize, importModels: own.importModels };
  }
}

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
 * 直接导入项目内的模块；TS 源码会自动注册 tsx 加载器，等价 vite 直接读 vite.config.ts。
 */
export async function importModule(file: string, root = process.cwd()) {
  if (/\.(ts|mts|cts)$/i.test(file) && !(await tryRegisterTsx(root))) {
    throw new Error(`读取 ${file} 需要 tsx，但项目里没有安装。请执行 pnpm add -D tsx，或改用编译后的 dist 文件`);
  }
  return await import(pathToFileURL(file).href);
}

/**
 * 源码模式下配置里的实体 glob 通常按编译产物写成 *.entity.js（只有 dist 里才有 .js），
 * 直接用它匹配不到任何模型。这里按同一目录补一次 *.entity.ts。
 * 必须用项目自己的 importModels：CLI 副本认不出项目模型（不是同一个 Model 基类），会过滤成 0 个。
 */
async function fillSourceModels<T extends { models?: unknown[] }>(config: T, dbConfig: string, root: string) {
  if (config.models?.length) return config;
  const { importModels: projectImportModels } = await projectCore(root);
  const models = await projectImportModels(join(configRoot(dbConfig), '**/*.entity.ts').replace(/\\/g, '/'));
  if (models.length) config.models = models;
  return config;
}

export async function getConfig(dbConfig: string, name?: string, root = process.cwd()) {
  const isSource = /\.(ts|mts|cts)$/i.test(dbConfig);
  let file = dbConfig;
  if (isSource && !(await tryRegisterTsx(root))) {
    //项目没装 tsx 时退回编译产物，保持原有用法可用
    const fallback = join(root, 'dist/config/database.js');
    if (!existsSync(fallback)) throw new Error(`读取 ${dbConfig} 需要 tsx，但项目里没有安装。请执行 pnpm add -D tsx，或用 -d 指定 dist/config/database.js`);
    Log.warn(`项目未安装 tsx，已改用 ${fallback}`);
    file = fallback;
  }
  const infos = await importModule(file, root);
  const config = await (infos.__esModule ? infos.default : infos).default();
  const configName = name ?? config.defaultDataSourceName ?? 'default';
  const dataSource = config.dataSource[configName];
  if (isSource && file === dbConfig) await fillSourceModels(dataSource, dbConfig, root);
  return dataSource;
}

import dotenv from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** 数据库连接信息（发布命令从项目环境文件中读取） */
export type DbConfig = {
  host: string;
  port: number;
  database: string;
  schema: string;
  user: string;
  password: string;
  /** 实际使用的环境文件绝对路径 */
  envFile: string;
};

//按顺序查找，第一个配置完整的文件生效（.env 是随模板发布的占位配置，数据库项默认为空）
const DEFAULT_ENV_FILES = ['.env.local', '.env'];

const readEnvFile = (file: string) => (existsSync(file) ? dotenv.parse(readFileSync(file)) : null);

/**
 * 按环境名合并 `.env` + `.env.<env>`（后者覆盖前者），与 CLI 其它命令的 `-m` 语义一致。
 * 空值视为未配置，不会被后面的文件覆盖成空，避免占位项把真实配置冲掉。
 */
function mergeEnvChain(files: string[]) {
  const merged: Record<string, string> = {};
  const present: string[] = [];
  for (const file of files) {
    const parsed = readEnvFile(file);
    if (!parsed) continue;
    present.push(file);
    for (const [key, value] of Object.entries(parsed)) {
      if (value.trim()) merged[key] = value;
    }
  }
  return { merged, present };
}

/**
 * 解析数据库配置。
 * 优先级：`--env` 指定文件 > `-m <env>`（.env + .env.<env>）> 默认按 .env.local、.env 找第一份配置完整的文件。
 */
export function loadDbConfig(cwd: string, envFile?: string, schema?: string, mode?: string): DbConfig {
  if (mode && !envFile) {
    const modeFile = resolve(`${cwd}/.env.${mode}`);
    if (!existsSync(modeFile)) throw new Error(`-m ${mode} 未找到环境文件：${modeFile}（不加 -m 时会依次查找 .env.local、.env）`);
    const chain = [resolve(`${cwd}/.env`), modeFile];
    const { merged, present } = mergeEnvChain(chain);
    if (!present.length) throw new Error(`-m ${mode} 未找到环境文件：\n- ${chain.join('\n- ')}`);
    const value = (key: string) => (merged[key] ?? process.env[key] ?? '').trim();
    const config = {
      host: value('DATABASE_HOST'),
      port: Number(value('DATABASE_PORT')),
      database: value('DATABASE_DB'),
      schema: schema?.trim() || value('DATABASE_SCHEMA'),
      user: value('DATABASE_USER'),
      password: value('DATABASE_PASSWORD'),
    };
    const emptyKeys = Object.entries(config)
      .filter(([, item]) => !item)
      .map(([key]) => key);
    if (emptyKeys.length) throw new Error(`-m ${mode} 的配置不完整，${emptyKeys.join('、')} 未填写：\n- ${present.join('\n- ')}`);
    return { ...config, envFile: present[present.length - 1] };
  }

  const candidates = envFile ? [resolve(cwd, envFile)] : DEFAULT_ENV_FILES.map((name) => resolve(cwd, name));
  const reasons: string[] = [];
  for (const file of candidates) {
    const parsed = readEnvFile(file);
    if (!parsed) {
      reasons.push(`${file}（文件不存在）`);
      continue;
    }
    const value = (key: string) => (parsed[key] ?? process.env[key] ?? '').trim();
    const config = {
      host: value('DATABASE_HOST'),
      port: Number(value('DATABASE_PORT')),
      database: value('DATABASE_DB'),
      schema: schema?.trim() || value('DATABASE_SCHEMA'),
      user: value('DATABASE_USER'),
      password: value('DATABASE_PASSWORD'),
    };
    const emptyKeys = Object.entries(config)
      .filter(([, item]) => !item)
      .map(([key]) => key);
    if (emptyKeys.length) {
      reasons.push(`${file}（${emptyKeys.join('、')} 未填写）`);
      continue;
    }
    return { ...config, envFile: file };
  }
  throw new Error(`未能获取数据库配置，请检查以下文件：\n- ${reasons.join('\n- ')}\n也可以用 -m <env> 指定环境，或 --env 指定配置文件。`);
}

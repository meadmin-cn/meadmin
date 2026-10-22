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
 * 解析数据库配置：优先使用显式指定的文件，否则按 .env.local、.env 的顺序找到第一份配置完整的文件。
 */
export function loadDbConfig(cwd: string, envFile?: string, schema?: string): DbConfig {
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
  throw new Error(`未能获取数据库配置，请检查以下文件：\n- ${reasons.join('\n- ')}\n也可以通过 --env 参数指定配置文件。`);
}

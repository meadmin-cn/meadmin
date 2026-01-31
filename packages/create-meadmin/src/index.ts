import { Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import spawn from 'cross-spawn';
import { mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import * as readlinePromises from 'node:readline/promises';
import { copyFile, copyPath } from './utils/file.js';

const rl = readlinePromises.createInterface({ input, output });
try {
  const fromPath = resolve(import.meta.dirname + '/../template/meadmin/');

  const sql = readFileSync(resolve(fromPath, 'meadmin.sql')).toString();

  const toPath = (await rl.question('请输入项目目录，为空则创建在当前命令执行跟目录')) ?? '';
  const DATABASE_HOST = await rl.question('请输入数据库连接host地址');
  const DATABASE_PORT = await rl.question('请输入数据库连接端口');
  const DATABASE_DB = await rl.question('请输入数据库名称');
  const DATABASE_SCHEMA = await rl.question('请输入数据库实例(schema)名称');
  const DATABASE_USER = await rl.question('请输入数据库登录用户名');
  const DATABASE_PASSWORD = await rl.question('请输入数据库登录密码');
  const REDIS_HOST = await rl.question('请输入reidis连接host地址');
  const REDIS_PORT = await rl.question('请输入reidis连接端口');
  const REDIS_PASS = await rl.question('请输入reidis密码');
  const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: DATABASE_DB,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    host: DATABASE_HOST,
    port: +DATABASE_PORT,
    schema: DATABASE_SCHEMA,
    ssl: true,
    clientMinMessages: 'notice',
  });
  console.log('正在同步数据库结构...\n');
  const res = await sequelize.queryRaw(sql);
  sequelize.close();
  console.log('数据库同步完成', res);
  const fileList = readdirSync(fromPath);
  console.log('\n正在创建项目文件...');
  await Promise.all(
    fileList.map(async (file) => {
      const path = resolve(fromPath, file);
      const toSetPath = resolve(toPath, file);
      const stats = statSync(path);
      if (stats.isDirectory()) {
        mkdirSync(toSetPath, { recursive: true });
        //文件夹递归处理
        copyPath(path, toSetPath, '', [], undefined, false);
      } else {
        await copyFile(
          path,
          toSetPath,
          file === '.env'
            ? (content: string) => {
                return content
                  .replace('{DATABASE_HOST}', DATABASE_HOST)
                  .replace('{DATABASE_PORT}', DATABASE_PORT)
                  .replace('{DATABASE_DB}', DATABASE_DB)
                  .replace('{DATABASE_SCHEMA}', DATABASE_SCHEMA)
                  .replace('{DATABASE_USER}', DATABASE_USER)
                  .replace('{DATABASE_PASSWORD}', DATABASE_PASSWORD)
                  .replace('{REDIS_HOST}', REDIS_HOST)
                  .replace('{REDIS_PORT}', REDIS_PORT)
                  .replace('{REDIS_PASS}', REDIS_PASS);
              }
            : undefined,
          false,
        );
      }
    }),
  );
  // 同步生成子进程，运行npm命令
  const { error } = spawn.sync('pnpm', '--version', { stdio: 'inherit' });
  console.log('创建成功，项目必须使用pnpm启动，请执行pnpm install 后运行pnpm dev 调试项目');
  if (error) {
    console.log('\n检测到当前未安装pnpm，请执行npm install -g pnpm命令先安装pnpm');
  }
} catch (e) {
  console.error(e);
} finally {
  rl.close();
}

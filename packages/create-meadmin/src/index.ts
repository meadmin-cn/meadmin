import { QueryTypes, Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import spawn from 'cross-spawn';
import { mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import * as readlinePromises from 'node:readline/promises';
import { setEnv } from './utils/env.js';
import { copyFile, copyPath } from './utils/file.js';
const args = process.argv.slice(2); // 从第三个元素开始是用户输入的参数
let debug = false;
if (args.includes('--debug')) {
  debug = true;
}
let envd = false;
const modelIndex = args.indexOf('-m');
if (modelIndex >= 0) {
  setEnv(args[modelIndex + 1]);
  envd = true;
}

const rl = readlinePromises.createInterface({ input, output });
try {
  const fromPath = resolve(import.meta.dirname + '/../template/meadmin/');
  const sql = readFileSync(resolve(fromPath, 'meadmin.sql')).toString();
  const toPath = (await rl.question('请输入项目目录，为空则创建在当前命令执行根目录\n')) ?? '';
  const DATABASE_HOST = envd ? process.env.DATABASE_HOST : await rl.question('请输入数据库连接host地址\n');
  const DATABASE_PORT = envd ? process.env.DATABASE_PORT : await rl.question('请输入数据库连接端口\n');
  const DATABASE_DB = envd ? process.env.DATABASE_DB : await rl.question('请输入数据库名称\n');
  const DATABASE_SCHEMA = envd ? process.env.DATABASE_SCHEMA : await rl.question('请输入数据库实例(schema)名称\n');
  const DATABASE_USER = envd ? process.env.DATABASE_USER : await rl.question('请输入数据库登录用户名\n');
  const DATABASE_PASSWORD = envd ? process.env.DATABASE_PASSWORD : await rl.question('请输入数据库登录密码\n');
  const REDIS_HOST = envd ? process.env.REDIS_HOST : await rl.question('请输入reidis连接host地址\n');
  const REDIS_PORT = envd ? process.env.REDIS_PORT : await rl.question('请输入reidis连接端口\n');
  const REDIS_PASS = envd ? process.env.REDIS_PASS : await rl.question('请输入reidis密码\n');
  rl.close();
  console.log('正在同步数据库结构...\n');
  const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: DATABASE_DB,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    host: DATABASE_HOST,
    port: +DATABASE_PORT,
    options: `-c search_path=${DATABASE_SCHEMA}`,
    logging: debug
      ? (sql, timing) => {
          console.log(new Date(), `[${timing}]:${sql}`);
        }
      : undefined,
    benchmark: true, //开启日志打印sql耗时参数传递
  });
  await sequelize.queryRaw(sql, { raw: true, type: QueryTypes.RAW });
  sequelize.close();
  console.log('数据库同步完成');
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
  console.log(`创建成功，项目必须使用pnpm启动，请执行以下命令调试项目。
${error ? '- npm install -g pnpm\n' : '\n'}- pnpm install
- pnpx husky install (可选，执行后会初始化git提交格代码式化钩子) 
- pnpm dev
  `);
} catch (e) {
  console.error(e);
} finally {
  rl.close();
}

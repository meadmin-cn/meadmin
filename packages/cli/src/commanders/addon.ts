import Sequelize from '@sequelize/core';
import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getConfig } from '../utils/db.js';
import { checkPathFile, copyFile, copyPath } from '../utils/file.js';
import { upFirstCase } from '../utils/formatting.js';
import { Log } from '../utils/log.js';

// 需要复制的文件，key为文件路径，文件夹以/结尾，{
//   ignore:忽略文件支持正则或字符串数组
//   fileSetFunction,//单个文件处理函数，key为文件相对于文件夹路径，值为对应函数，content=>str
// },
// key文件路径为单个文件时，允许值为文件处理函数：content=>str
const copyFiles = {
  'src/app/admin/addons/{addon}/': {},
  'src/app/index/addons/{addon}/': {},
  'view/admin/src/addons/{addon}/': {},
  'view/index/src/addons/{addon}/': {},
} as Record<
  string,
  {
    ignore?: Array<string | RegExp>;
    fileSetFunction?: Record<string, (content: string) => string>;
  }
>;
//安装时可删除的插件文件夹
const rmDIr = ['src/app/admin/addons/{addon}/', 'src/app/index/addons/{addon}/', 'view/admin/src/addons/{addon}/', 'view/index/src/addons/{addon}/'];
let sequelize: Sequelize | null = null;
/**
 * 卸载插件
 * @param file 插件名称
 * @param dbConfig 数据库配置文件地址
 * @param name 使用的数据库配置name
 */
const rmAddon = async (file: string, dbConfig: string, name: string, options: Record<string, any>) => {
  //删除插件文件夹
  rmDIr.forEach((k) => {
    const key = k.replace('{addon}', file);
    const toPath = resolve(process.cwd(), key);
    rmSync(toPath, { force: true, recursive: true });
  });
  //删除插件数据库实体
  const entityFilePath = resolve(process.cwd(), 'src/entities/');
  const entityFiles = readdirSync(entityFilePath);
  entityFiles.forEach((file) => {
    if (!new RegExp(`^(?!aon${upFirstCase(file)}[A-Z.])`).test(file)) {
      rmSync(resolve(entityFilePath, file), { force: true, recursive: true });
    }
  });
  const info = readFileSync(resolve(process.cwd(), `addons/${file}/`, 'addons.json'), 'utf-8');
  if (!options.nr && info) {
    const infoContent = JSON.parse(info);
    if (infoContent.uninstallShells?.length) {
      Log.log('正在执行卸载脚本...');
      infoContent.uninstallShells.forEach((command: string) => {
        Log.log(`卸载脚本 ${command} 正在执行...`);
        const execRes = execSync(command, { encoding: 'utf-8' });
        Log.log(`卸载脚本 ${command} 执行完成:` + execRes);
      });
      Log.log('卸载脚本全部执行完成');
    }
  }
  const uninstallSqlPath = resolve(process.cwd(), `addons/${file}/uninstall.sql`);
  if (!options.nsql && existsSync(uninstallSqlPath)) {
    const config = Object.assign(await getConfig(dbConfig, name), {
      logging: (message: string) => Log.log(message),
    });
    if (!sequelize) {
      sequelize = new Sequelize(config);
    }
    await sequelize.queryRaw(readFileSync(uninstallSqlPath, 'utf-8'));
    if (options.rm) {
      await sequelize.close();
    }
  }
};
export const addoonInit = (program: Command) => {
  program
    .command('addon')
    .description('安装插件')
    .argument('<file>', '插件名称')
    .option('-c, --create', '创建插件包')
    .option('--cp', '从现有应用目录copy文件到插件模块')
    .option('-f, --force', '强制执行(重复文件会被覆盖)')
    .option('--rm', '卸载插件(会删除插件文件及对应数据库内容)')
    .option('-d, --dbConfig <char>', '数据库配置文件地址默认为当前目录下dist/config/database.js', join(process.cwd(), 'dist/config/database.js'))
    .option('-n, --name <char>', '使用的数据库配置defaultDataSourceName')
    .option('--nsql', '不执行对应的sql语句')
    .option('--nr', '不执行对应的脚本命令')
    .action(async (file: string, options: Record<string, any>) => {
      if (options.create) {
        const toPath = resolve(process.cwd(), `addons/${file}/`);
        if (existsSync(toPath)) {
          if (readdirSync(toPath).length > 0) {
            if (options.force) {
              rmSync(toPath, { recursive: true });
            } else {
              return Log.error(`目标文件夹${toPath}不为空,如果想要强制覆盖请使用-f参数\n`);
            }
          }
        }
        cpSync(resolve(import.meta.dirname, '../../template/addons'), resolve(process.cwd(), `addons/${file}/`), {
          recursive: true,
        });
        const packageContent = readFileSync(resolve(toPath, 'packageTemplate.json'), 'utf-8');
        rmSync(resolve(toPath, 'packageTemplate.json'));
        writeFileSync(resolve(toPath, 'package.json'), packageContent.replace('{addonsName}', file), 'utf-8');
        const addonsContent = readFileSync(resolve(toPath, 'addons.json'), 'utf-8');
        writeFileSync(resolve(toPath, 'addons.json'), addonsContent.replace('{addonsName}', file), 'utf-8');
        Log.success(file + '插件创建成功');
      } else if (options.cp) {
        const toPath = resolve(process.cwd(), 'addons', file, 'template/');
        const fromPath = resolve(process.cwd());
        if (existsSync(toPath)) {
          if (readdirSync(toPath).length > 0) {
            if (options.force) {
              rmSync(toPath, { recursive: true });
            } else {
              return Log.error(`目标文件夹${toPath}不为空,如果想要强制覆盖请使用-f参数\n`);
            }
          }
        }
        await Promise.all(
          Object.keys(copyFiles).map(async (k) => {
            const key = k.replace('{addon}', file);
            if (key.endsWith('/')) {
              await copyPath(resolve(fromPath, key), resolve(toPath, key), '', copyFiles[k].ignore || [], copyFiles[k].fileSetFunction, true);
            } else {
              await copyFile(resolve(fromPath, key), resolve(toPath, key), typeof copyFiles[k] === 'function' ? copyFiles[k] : undefined, true);
            }
          }),
        );
        await copyPath(resolve(fromPath, 'src/entities/'), resolve(toPath, 'src/entities/'), '', [new RegExp(`^(?!aon${upFirstCase(file)}[A-Z.])`)]);
        Log.success(file + '插件模板复制完成');
      } else if (options.rm) {
        await rmAddon(file, options.dbConfig, options.name, options);
        Log.success(file + '插件卸载成功');
      } else {
        const fromPath = resolve(process.cwd(), `addons/${file}/template/`);
        const toPath = resolve(process.cwd());
        if (!options.force) {
          const hasFiles = checkPathFile(fromPath, toPath);
          if (hasFiles.length) {
            return Log.warn('以下文件已存在,如果想要强制覆盖请使用-f参数\n' + hasFiles.join('\n'));
          }
        } else {
          Log.log('正在卸载插件...');
          await rmAddon(file, options.dbConfig, options.name, options);
          Log.log(file + '插件卸载成功');
        }
        Log.log('正在安装插件代码文件...');
        await copyPath(fromPath, toPath, '', [], undefined, true);
        Log.log('插件代码文件安装完成');
        const info = readFileSync(resolve(process.cwd(), `addons/${file}/`, 'addons.json'), 'utf-8');
        if (!options.nr && info) {
          const infoContent = JSON.parse(info);
          if (infoContent.installShells?.length) {
            Log.log('正在执行安装脚本...');
            infoContent.installShells.forEach((command: string) => {
              Log.log(`安装脚本 ${command} 正在执行...`);
              const execRes = execSync(command, { encoding: 'utf-8' });
              Log.log(`安装脚本 ${command} 执行完成:` + execRes);
            });
            Log.log('安装脚本全部执行完成');
          }
        }
        const installSqlPath = resolve(process.cwd(), `addons/${file}/install.sql`);
        if (!options.nsql && existsSync(installSqlPath)) {
          Log.log('正在执行数据库脚本...');
          const config = Object.assign(await getConfig(options.dbConfig, options.name), {
            logging: (message: string) => Log.log(message),
          });
          if (!sequelize) {
            sequelize = new Sequelize(config);
          }
          await sequelize.queryRaw(readFileSync(installSqlPath, 'utf-8'));
          await sequelize.close();
          Log.log('安装脚数据库脚本执行完成');
        }
        Log.success(file + '插件安装成功');
      }
    });
};

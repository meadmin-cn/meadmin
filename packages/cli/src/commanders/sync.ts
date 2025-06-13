import { Command } from 'commander';
import { join, resolve } from 'node:path';
import { importModels, Sequelize } from '@sequelize/core';
import { Log } from '../utils/log.js';
import { getConfig } from '../utils/db.js';


export const syncInit =  (program: Command) => {
  program
    .command('sync')
    .description('同步数据库结构')
    .argument(
      '<file>',
      '需要同步的entity文件地址支持，隔开的多文件或glob,文件地址相对于项目dist/entities'
    )
    .option(
      '-d, --dbConfig <char>',
      '数据库配置文件地址默认为当前目录下dist/config/database.js',
      join(process.cwd(), 'dist/config/database.js')
    )
    .option('-n, --name <char>', '使用的数据库配置defaultDataSourceName')
    .action(async (file: string, options) => {
      const files = file.split(',');
      const config = Object.assign(
        await getConfig(options.dbConfig, options.name),
        {
          logging: message=>Log.log(message),
          models: await importModels(files.map(item =>
            resolve(
              process.cwd(),
              'dist/entities/',
              item.endsWith('.js') ||
                item.endsWith('.mjs') ||
                item.endsWith('.cjs') ||
                item.endsWith('.ts') ||
                item.endsWith('.mts') ||
                item.endsWith('.cts')
                ? item
                : item + '.entity.js'
            ).replace(/\\/g,'/')
          )),
        }
      );
      const sequelize = new Sequelize(config);
      await sequelize.sync({alter:true});
      sequelize.close();
      Log.success('同步数据表结构成功');
    });
};

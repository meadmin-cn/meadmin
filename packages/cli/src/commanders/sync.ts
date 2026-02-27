import { Sequelize } from '@sequelize/core';
import { Command } from 'commander';
import { upperFirst } from 'lodash-es';
import { join } from 'node:path';
import { getConfig } from '../utils/db.js';
import { Log } from '../utils/log.js';

export const syncInit = (program: Command) => {
  program
    .command('sync')
    .description('同步数据库结构')
    .argument('<file>', '需要同步的entity实例name(支持,隔开的多个name)或*(*代表所有)')
    .option('-d, --dbConfig <char>', '数据库配置文件地址默认为当前目录下dist/config/database.js', join(process.cwd(), 'dist/config/database.js'))
    .option('-n, --name <char>', '使用的数据库配置defaultDataSourceName')
    .action(async (file: string, options) => {
      const config = Object.assign(await getConfig(options.dbConfig, options.name), {
        logging: (message) => Log.log(message),
      });
      const sequelize = new Sequelize(config);
      if (file === '*') {
        await sequelize.sync({ alter: true });
      } else {
        const files = file.split(' '); //,隔开的空格会自动转空格
        for (let i = 0; i < files.length; i++) {
          let model = files[i];
          if (sequelize.models.hasByName(model)) {
            await sequelize.models.get(model).sync({ alter: true });
          } else {
            model = upperFirst(model);
            if (sequelize.models.hasByName(model)) {
              await sequelize.models.get(model).sync({ alter: true });
            } else {
              Log.warn(model + '不存在，已自动跳过');
            }
          }
        }
      }
      sequelize.close();
      Log.success('同步数据表结构成功');
    });
};

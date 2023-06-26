import { Command, Option } from '../decorators';
import { AbstractCommand } from './abstract.command';
import { join, resolve } from 'node:path';
import { SyncLogger } from '../utils/syncLogger';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Log } from '../utils/log';
import { relativePath } from '../utils/formatting';
import { pathToFileURL } from 'node:url';

@Command(
  'sync <...path>',
  '同步数据库结构(支持多文件和glob,文件地址相对于dist/entities)',
)
export class Sync extends AbstractCommand {
  @Option('--dbConfig', '数据库配置文件地址', {
    default: join(process.cwd(), 'dist/config/database.js'),
  })
  dbConfig: string;

  @Option('--name', '匹配数据库别名', {
    default: 'default',
  })
  name: string;

  public async runCommand() {
    const config = Object.assign(await this.getConfig(), {
      synchronize: false,
      migrationsRun: false,
      logging: ['info', 'query', 'error'],
      logger: new SyncLogger(),
      migrations: [],
      entitySchemas: [],
      entities: (this.files as string[]).map((item) =>
        resolve(
          process.cwd(),
          'dist/entities',
          item.endsWith('.js') ||
            item.endsWith('.mjs') ||
            item.endsWith('.cjs') ||
            item.endsWith('.ts') ||
            item.endsWith('.mts') ||
            item.endsWith('.cts')
            ? item
            : item + '.js',
        ),
      ),
    });
    const dataSource = new DataSource(config);
    await dataSource.initialize();
    await dataSource.synchronize();
    await dataSource.destroy();
    Log.success('同步数据表结构成功');
  }

  public async getConfig() {
    const infos = await import(pathToFileURL(this.dbConfig).href);
    const configs: DataSourceOptions[] = (
      infos.__esModule ? infos.default : infos
    ).default();
    const config = configs.find(
      (config) => (config.name ?? 'default') === (this.name ?? 'default'),
    );
    if (!config) {
      throw new Error(`未获取到name为${this.name}的数据库配置`);
    }
    return config;
  }
}

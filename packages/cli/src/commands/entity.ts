import { Command, Option } from '../decorators';
import { AbstractCommand } from './abstract.command';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { prompt } from 'enquirer';

@Command('entity <path>', '创建数据库实例文件')
export class Entity extends AbstractCommand {
  @Option('--base, -b', '基础文件夹', { default: './src/entities' })
  base: string;

  private getTableName() {
    const names = (this.files as string).split('/');
    let name = names[names.length - 1];
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name;
  }

  private getPath() {
    return resolve(process.cwd(), this.base, this.files + '.entity.ts');
  }

  public async runCommand() {
    const filePath = this.getPath();
    if (existsSync(filePath)) {
      const data: Record<string, string> = await prompt({
        type: 'select',
        name: 'forceCreate',
        message: `${filePath}已存在?`,
        choices: ['取消创建', '覆盖文件'],
        muliple: false,
      });
      if (data.forceCreate === '取消创建') {
        return;
      }
    }
    const template = readFileSync(
      resolve(__dirname, '../../template/entity.ts'),
      'utf-8',
    );
    writeFileSync(filePath, template.replace('__Name__', this.getTableName()));
    console.info(`make ${filePath} success`);
  }
}

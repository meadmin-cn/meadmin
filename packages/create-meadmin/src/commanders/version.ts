//设置版本
import { Command } from 'commander';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
export const version = (program: Command) => {
  program
    .command('version')
    .description('设置版本号，会设置所以meadmin的版本号')
    .argument('<version>', '版本')
    .action(async (version: string) => {
      if (!version) {
        return console.error('必须指定版本号');
      }
      const path = resolve(process.cwd(), 'packages');
      const packages = readdirSync(path);
      packages.forEach((file) => {
        const contentStr = readFileSync(resolve(path, file, 'package.json'), 'utf-8');
        const content = JSON.parse(contentStr);
        content.version = version;
        writeFileSync(resolve(path, file, 'package.json'), JSON.stringify(content, null, 2), 'utf-8');
        console.log(`设置${content.name}版本成功`);
      });
    });
};

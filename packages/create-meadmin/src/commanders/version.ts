//设置版本
import { Command } from 'commander';
import { setVersions } from '../utils/version.js';

export const version = (program: Command) => {
  program
    .command('version')
    .description('设置版本号，会设置所有meadmin的版本号')
    .argument('<version>', '版本')
    .action(async (value: string) => {
      if (!value) return console.error('必须指定版本号');
      try {
        const changes = setVersions(process.cwd(), value);
        if (!changes.length) return console.log(`全部包已是 ${value}，无需修改`);
        changes.forEach((change) => console.log(`${change.name}: ${change.from} → ${value}`));
      } catch (error) {
        console.error((error as Error).message);
        process.exitCode = 1;
      }
    });
};

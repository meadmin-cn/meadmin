// 复刻 update 命令的真实调用链：先注册子命令 → init()（含 -m 钩子 setEnv）→ 执行 update.sql。
// 这样 -m 的注册方式、钩子时机与 update 完全一致。
import { Command } from 'commander';
import { init } from '../../../dist/commanders/index.js';
import { executeSqlFile } from '../../../dist/update/database.js';

const program = new Command();
program.command('probe').action(async () => {
  try {
    await executeSqlFile(process.cwd(), 'probe.sql');
  } catch (error) {
    console.log('EXEC_FAILED: ' + error.message);
  }
});
init(program);
program.parse(['node', 'cli', 'probe', ...process.argv.slice(2)]);

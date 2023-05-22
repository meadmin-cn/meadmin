import { createPlugin } from 'webpack-plugin-autogeneration-import-file';
import { execSync, spawn } from 'node:child_process';
import { Command, Option } from '../decorators';
import { AbstractCommand } from './abstract.command';
const { autoImport } = createPlugin();

@Command('auto-import', '自动生成文件')
export class AutoImport extends AbstractCommand {
  @Option('-w, --watch', '是否监听文件变更')
  watch: boolean;

  @Option('--spawn <spawn>', '需要执行的子命令')
  spawn: string;

  /**
   * 格式化命令
   *
   * @param   {string}  val  [val description]
   *
   * @return  {string[]}       [return description]
   */
  private filterSpawn(val: string) {
    return JSON.parse(
      execSync(`node -e "console.log(JSON.stringify(process.argv))" ${val}`, {
        encoding: 'utf8',
      }),
    ).slice(1);
  }

  /**
   * 执行命令
   *
   * @param   {string}      command  [command description]
   * @param   {string[][]}  args     [args description]
   *
   * @return  {[][]}                 [return description]
   */
  private spawnCommand(command: string, args: string[] = []) {
    spawn(
      command +
        (process.platform === 'win32' &&
        ['npx', 'npm', 'yarn', 'pnpm'].includes(command)
          ? '.cmd'
          : ''),
      args,
      { stdio: 'inherit' },
    );
  }

  async runCommand(): Promise<void> {
    const autoImportModel = new autoImport(this.config.autoImport);
    if (this.watch) {
      autoImportModel.hmr();
    }
    await autoImportModel.build();
    if (this.spawn) {
      const spawn = this.filterSpawn(this.spawn);
      spawn.length && this.spawnCommand(spawn[0], spawn);
    }
  }
}

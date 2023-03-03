import { Command, Option } from 'nest-commander';
import { AbstractCommand } from './abstract.command';
import { createPlugin } from 'webpack-plugin-autogeneration-import-file';
import { execSync, spawn } from 'node:child_process';
const { autoImport } = createPlugin();

@Command({
  name: 'auto-import',
})
export class AutoImport extends AbstractCommand {
  async runCommand(
    inputs: string[],
    options: Record<string, any>,
  ): Promise<void> {
    const autoImportModel = new autoImport(options.config.autoImport);
    await autoImportModel.build();
    if (options.watch) {
      autoImportModel.hmr();
    }
    if (options.spawn && options.spawn.length) {
      this.spawnCommand(options.spawn[0], options.spawn.slice(1));
    }
  }

  private spawnCommand(command: string, args: string[] = []) {
    const spawnObj = spawn(
      command +
        (process.platform === 'win32' &&
        ['npx', 'npm', 'yarn', 'pnpm'].includes(command)
          ? '.cmd'
          : ''),
      args,
    );
    spawnObj.stdout.on('data', function (chunk) {
      console.log('\n' + chunk.toString());
    });
    spawnObj.stderr.on('data', (data) => {
      console.error('\n' + data.toString());
    });
    spawnObj.on('close', function (code) {
      console.log('close code : ' + code);
    });
    spawnObj.on('exit', (code) => {
      console.log('exit code : ' + code);
    });
  }

  @Option({
    flags: '-w, --watch',
    description: '是否监听文件变更',
  })
  parseWatch() {
    return true;
  }

  @Option({
    flags: '--spawn <spawn>',
    description: '需要执行的子命令',
  })
  parseSpawn(val: string) {
    return JSON.parse(
      execSync(`node -e "console.log(JSON.stringify(process.argv))" ${val}`, {
        encoding: 'utf8',
      }),
    ).slice(1);
  }
}

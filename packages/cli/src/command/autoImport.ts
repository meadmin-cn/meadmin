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
    if (options.watch) {
      autoImportModel.hmr();
    }
    await autoImportModel.build();
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
      chunk && console.info(chunk.toString());
    });
    spawnObj.stderr.on('error', (data) => {
      data && console.error(data.toString());
    });
    spawnObj.on('close', function (code) {
      console.info('close code : ' + code);
    });
    spawnObj.on('exit', (code) => {
      console.info('exit code : ' + code);
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

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolve } from 'path';
import { Option } from '../decorators';
import { loadEnvFile } from '../utils/loadEnv';
export abstract class AbstractCommand {
  public files: string[] | string;

  protected config: Record<string, any>;
  @Option('-c, --config-path <configPath>', '配置文件地址', {
    default: 'meadmin-config.mjs',
  })
  configPath: string;
  abstract runCommand(): Promise<void>;

  async run(): Promise<void> {
    this.config = (
      await import(
        pathToFileURL(
          resolve(process.cwd(), this.configPath || 'meadmin-config.mjs'),
        ).href
      )
    ).default;
    loadEnvFile(this.config.envPath ?? [join(process.cwd(), '.env')]);
    this.runCommand();
  }
}

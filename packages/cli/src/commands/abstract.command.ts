import { pathToFileURL } from 'node:url';
import { resolve } from 'path';
import { Option } from '../decorators';
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
    this.runCommand();
  }
}

import { CommandRunner, InquirerService, Option } from "nest-commander";
import { pathToFileURL } from "node:url";
import { resolve } from "path";

export abstract class AbstractCommand extends CommandRunner{

    abstract runCommand(passedParams: string[], options?: Record<string, any>): Promise<void>;

    async run(inputs: string[], options: Record<string, any>): Promise<void> {
        options.config = (await import(pathToFileURL(resolve(process.cwd(),options.configPath || 'meadmin-config.mjs')).href)).default;
        this.runCommand(inputs,options);
    }

    @Option({
        flags: '-c, --config-path <configPath>',
        description: '配置文件地址，默认为meadmin-config.mjs'
    })
    parseConfigPath(val: string) {
        return val;
    }
}
  
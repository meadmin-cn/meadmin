import { Command, CommandRunner, InquirerService,Option  } from "nest-commander";
import { AbstractCommand } from "./abstract.command";
import { createPlugin } from 'webpack-plugin-autogeneration-import-file' ;
const { autoImport } = createPlugin();

@Command({
  name: 'auto-import'
})
export class AutoImport extends AbstractCommand {
  async runCommand(inputs: string[], options: Record<string, any>): Promise<void> {
    console.log('options',options);
    const autoImportModel = new autoImport(options.config.autoImport);
    await autoImportModel.build();
    if(options.watch){
      autoImportModel.hmr();
    }
  }
 
  @Option({
    flags: '-w, --watch',
    description: '是否监听文件变更'
  })
  parseWatch() {
    return true;
  }
}
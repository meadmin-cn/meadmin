import { Commands } from './commands';
import { cac } from 'cac';
import { COMMAND, OPTION } from './dict';
import { readFileSync } from 'node:fs';
const { version } = JSON.parse(
  readFileSync(__dirname + '/../package.json').toString(),
);
const cli = cac('meadmin');
Commands.forEach((item) => {
  const commandConfig = Reflect.getMetadata(COMMAND, item);
  if (commandConfig) {
    let command = cli.command(
      commandConfig.name,
      commandConfig.description,
      commandConfig.config,
    );
    const options = Reflect.getMetadata(OPTION, item);
    if (options) {
      options.forEach((item) => {
        command = command.option(item.name, item.description, item.config);
      });
    }
    command.action((...args) => {
      const commandObj = new item();
      if (options) {
        Object.assign(commandObj, args[args.length - 1]);
        args.pop();
      }
      if (args.length > 0) {
        commandObj.files = args.length === 1 ? args[0] : args;
      }
      commandObj.run();
    });
  }
});
cli.version(version);
cli.help();
cli.parse();

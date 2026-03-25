import { Command } from 'commander';
import { setMeadminTemplate } from './setMeadminTemplate.js';
import { version } from './version.js';
export const init = (program: Command) => {
  setMeadminTemplate(program);
  version(program);
};

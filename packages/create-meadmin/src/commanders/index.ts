import { Command } from 'commander';
import { releaseMeadmin } from './releaseMeadmin.js';
import { setMeadminTemplate } from './setMeadminTemplate.js';
import { version } from './version.js';
export const init = (program: Command) => {
  releaseMeadmin(program);
  setMeadminTemplate(program);
  version(program);
};

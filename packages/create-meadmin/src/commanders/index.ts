import { Command } from 'commander';
import { setMeadminTemplate } from './setMeadminTemplate.js';
export const init = (program: Command) => {
  setMeadminTemplate(program);
};

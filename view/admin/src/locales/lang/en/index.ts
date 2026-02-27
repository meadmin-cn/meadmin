import { forOwn } from 'lodash-es';
const modules = import.meta.glob('./**/*.{json,ts}', {
  eager: true,
  import: 'default',
});
const addonsModules = import.meta.glob('../../../addons/*/locales/lang/en/index.ts', { eager: true, import: 'default' });
const langs = {} as Record<string, string>;
forOwn(addonsModules, (value) => {
  Object.assign(langs, value);
});
forOwn(modules, (value) => {
  Object.assign(langs, value);
});
export default langs;

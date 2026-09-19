import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import type { Plugin } from 'vite';

const registryId = 'virtual:me-element-icons';
const iconPrefix = 'virtual:me-element-icon/';

// icons-vue 只发布聚合模块。构建时按其组件边界拆成虚拟模块，运行时每个图标独立 import。
// 不修改 node_modules；保留原始 Vue 渲染代码及许可声明。
export default function lazyIcons(): Plugin {
  const require = createRequire(import.meta.url);
  const source = readFileSync(resolve(dirname(require.resolve('@element-plus/icons-vue')), 'index.js'), 'utf8');
  const exportsStart = source.lastIndexOf('export {');
  const exports = new Map<string, string>();
  for (const match of source.slice(exportsStart).matchAll(/(\w+) as (\w+)/g)) exports.set(match[1], match[2]);
  const modules = new Map<string, string>();
  for (const block of source
    .slice(0, exportsStart)
    .split(/(?=\/\/ src\/components\/)/)
    .slice(1)) {
    const binding = block.match(/,\s*(\w+_default)\s*=\s*\w+;/)?.[1];
    const name = binding && exports.get(binding);
    if (!name) throw new Error('icons-vue 分发结构已改变，请检查 lazyIcons 插件');
    modules.set(name, `/*! Element Plus Icons Vue | MIT */\n${block}\nexport default ${binding};`);
  }
  if (!modules.size || modules.size !== exports.size) throw new Error('icons-vue 图标导出不完整');

  return {
    name: 'me-lazy-element-icons',
    resolveId(id) {
      if (id === registryId || id.startsWith(iconPrefix)) return '\0' + id;
    },
    load(id) {
      if (id === '\0' + registryId) {
        return `export default {\n${[...modules.keys()].map((name) => `${JSON.stringify(name)}: () => import(${JSON.stringify(iconPrefix + name)}).then(m => m.default)`).join(',\n')}\n};`;
      }
      if (id.startsWith('\0' + iconPrefix)) {
        const name = id.slice(('\0' + iconPrefix).length);
        const code = modules.get(name);
        if (!code) throw new Error(`未知图标：${name}`);
        return code;
      }
    },
  };
}

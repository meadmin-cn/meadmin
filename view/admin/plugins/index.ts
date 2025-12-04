import { ConfigEnv, Plugin } from 'vite';
import autoComponents from './autoComponents.js';
import autoImport from './autoImport.js';
import autoImportApi from './autoImportApi.js';
import babel from './babel.js';
import svgLoader from './svgLoader.js';
import vueSetUpExtend from './vueSetUpExtend.js';
import { visualizer } from 'rollup-plugin-visualizer'; //打包大小分析（stats.html）
import vue from '@vitejs/plugin-vue';
// import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
// import { splitVendorChunkPlugin } from 'vite';
import { compression } from 'vite-plugin-compression2';//压缩gz和br
const virtualFile = '@virtual-file';
const virtualId = '\0' + virtualFile;
const nestedVirtualFile = '@nested-virtual-file';
const nestedVirtualId = '\0' + nestedVirtualFile;
export default (configEnv: ConfigEnv) => {
  return [
    vue(),
    // splitVendorChunkPlugin(), //打包分析，会生成stats.html展示打包情况
    // VueI18nPlugin({
    //   /* options */
    //   // locale messages resource pre-compile option
    //   include: ['./src/**/lang/**/*.json', './src/**/lang/*.json'],
    // }),
    visualizer(),
    compression(),
    autoComponents(),
    autoImport(),
    autoImportApi(),
    babel(),
    svgLoader(),
    vueSetUpExtend(),
    //ssr需求插件
    {
      name: 'virtual',
      resolveId(id: string) {
        if (id === '@foo') {
          return id;
        }
      },
      load(id: string, options?: { ssr?:boolean; }) {
        const ssrFromOptions = options?.ssr ?? false;
        if (id === '@foo') {
          // Force a mismatch error if ssrBuild is different from ssrFromOptions 如果 ssrBuild 与 ssrFromOptions 不同，则强制出现不匹配错误
          return `export default { msg: '${
            configEnv.command === 'build' && !!configEnv.isSsrBuild !== ssrFromOptions
              ? 'defineConfig ssrBuild !== ssr from load options'
              : 'hi'
          }' }`;
        }
      },
    },
    {
      name: 'virtual-module',
      resolveId(id: string) {
        if (id === virtualFile) {
          return virtualId;
        } else if (id === nestedVirtualFile) {
          return nestedVirtualId;
        }
      },
      load(id: string) {
        if (id === virtualId) {
          return 'export { msg } from "@nested-virtual-file";';
        } else if (id === nestedVirtualId) {
          return 'export const msg = "[success] from conventional virtual file"';
        }
      },
    },
    // Example of a plugin that injects a helper from a virtual module that can
    // be used in renderBuiltUrl  从虚拟模块注入辅助函数的插件示例，该模块可在 renderBuiltUrl 中使用
    (function () {
      const queryRE = /\?.*$/s;
      const hashRE = /#.*$/s;
      const cleanUrl = (url: string) => url.replace(hashRE, '').replace(queryRE, '');
      let config: { base: any; build: { ssr: any; }; };

      const virtualId = '\0virtual:ssr-vue-built-url';
      return {
        name: 'built-url',
        enforce: 'post' as const,
        configResolved(_config: { base: any; build: { ssr: any; }; }) {
          config = _config;
        },
        resolveId(id: string) {
          if (id === virtualId) {
            return id;
          }
        },
        load(id: string) {
          if (id === virtualId) {
            return {
              code: `export const __ssr_vue_processAssetPath = (url) => '${config.base}' + url`,
              moduleSideEffects: 'no-treeshake' as const,
            };
          }
        },
        transform(code: string | string[], id: string) {
          const cleanId = cleanUrl(id);
          if (
            config.build.ssr &&
            (cleanId.endsWith('.js') || cleanId.endsWith('.vue')) &&
            !code.includes('__ssr_vue_processAssetPath')
          ) {
            return {
              code:
                `import { __ssr_vue_processAssetPath } from '${virtualId}';__ssr_vue_processAssetPath;` +
                code,
              sourcemap: null, // no sourcemap support to speed up CI
            };
          }
        },
      };
    })(),
  ];
};

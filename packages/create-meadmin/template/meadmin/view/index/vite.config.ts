import { resolve } from 'path';
import type { ConfigEnv, UserConfig, UserConfigExport } from 'vite';
import plugins from './plugins/index.js';
// @ts-ignore
function pathResolve(dir: string) {
  return resolve(import.meta.dirname, '.', dir);
}
export default async (configEnv: ConfigEnv): Promise<UserConfigExport> => {
  const config = {
    root: import.meta.dirname,
    base: process.env.VIEW_INDEX_PATH_PRE,
    envPrefix: 'VIEW_INDEX_',
    plugins: await plugins(configEnv),
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`,
        },
      },
    },
    resolve: {
      alias: [
        // /@/xxxx => src/xxxx
        {
          find: '@/',
          replacement: pathResolve('src') + '/',
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    define: {
      __SSR__: `true`,
      __DEV__: configEnv.mode === 'development' ? `true` : `false`,
      __COMPAT__: `false`,
      __FEATURE_SUSPENSE__: `true`,
      __FEATURE_PROD_DEVTOOLS__: `false`,
    },
    server: {
      warmup: {
        //提前转换和缓存文件以进行预热。可以在服务器启动时提高初始页面加载速度，并防止转换瀑布
        clientFiles: [
          //仅在客户端使用的文件,路径相对于root
          './src/main.ts',
          './src/utils/request.ts',
        ],
      },
    },
    experimental: {
      //ssr需求代码
      renderBuiltUrl(filename: any, { hostType, type, ssr }: any) {
        if (ssr && type === 'asset' && hostType === 'js') {
          return {
            runtime: `__ssr_vue_processAssetPath(${JSON.stringify(filename)})`,
          };
        }
      },
    },
    build: {
      target: ['chrome93', 'safari15.2'],
      emptyOutDir: true,
    },
    optimizeDeps: {
      //因为项目中很多用到了自动引入和动态加载，所以vite首次扫描依赖项会扫描不全，这里强制扫描src下全局,并加载element-plus。
      entries: ['src/**/*.{ts,tsx,vue}', './index.html'],
      include: ['element-plus/es/components/loading/style/css', 'element-plus/es/components/message/style/css', 'element-plus/es/components/message-box/style/css', 'element-plus/es/components/notification/style/css', 'node_modules/element-plus/es/index.mjs'],
    },
  } as UserConfig;
  if (!configEnv.isSsrBuild) {
    config.build!.rolldownOptions = {
      output: {
        strictExecutionOrder: true, //强制引用顺序
        codeSplitting: {
          //自定义打包合并
          groups: [
            {
              test: /node_modules\/(vue|vue-router|pinia|vue-request|axios)/,
              name: 'core',
            },
            {
              test: /node_modules\/@element-plus\/icons-vue/,
              name: 'elIcon',
            },
            {
              test: /.\/mock/,
              name: 'mock',
            },
          ],
        },
      },
    };
  }
  return config;
};

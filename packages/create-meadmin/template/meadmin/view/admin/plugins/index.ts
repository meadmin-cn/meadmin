import vue from '@vitejs/plugin-vue';
// import type { ConfigEnv } from 'vite';
import autoComponents from './autoComponents.js';
import autoImport from './autoImport.js';
import autoImportApi from './autoImportApi.js';
import svgLoader from './svgLoader.js';
import vueSetUpExtend from './vueSetUpExtend.js';
// import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { compression } from 'vite-plugin-compression2'; //压缩gz和br
// const virtualFile = '@virtual-file';
// const virtualId = '\0' + virtualFile;
// const nestedVirtualFile = '@nested-virtual-file';
// const nestedVirtualId = '\0' + nestedVirtualFile;
export default () =>
  // _configEnv: ConfigEnv
  {
    return [
      vue(),
      // VueI18nPlugin({
      //   /* options */
      //   // locale messages resource pre-compile option
      //   include: ['./src/**/lang/**/*.json', './src/**/lang/*.json'],
      // }),
      compression(),
      autoComponents(),
      autoImport(),
      autoImportApi(),
      svgLoader(),
      vueSetUpExtend(),
    ];
  };

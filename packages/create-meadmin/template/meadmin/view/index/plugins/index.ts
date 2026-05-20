import vue from '@vitejs/plugin-vue';
import autoComponents from './autoComponents.js';
import autoImport from './autoImport.js';
import autoImportApi from './autoImportApi.js';
import svgLoader from './svgLoader.js';
import vueSetUpExtend from './vueSetUpExtend.js';
// import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { compression } from 'vite-plugin-compression2'; //压缩gz和br

export default () => {
  return [vue(), compression(), autoComponents(), autoImport(), autoImportApi(), svgLoader(), vueSetUpExtend()];
};

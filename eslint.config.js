import { defineConfig } from 'eslint/config';
import config from './eslint.config.base.js';

export default defineConfig(
  config,
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      'test/**',
      '.prettierrc.js',
      'commitlint.config.cjs',
      'eslint.config.js',
      'eslint.config.base.js',
      'packages/midway-vite-view/eaxmple/**',//忽略 midway-vite-view包示例文件
      '**/template/**', //忽略模板文件
      'view/**', //忽略校验，view前端代码单独使用自己规则不进行校验
    ],
  },
  {
    name: 'meadmin',
    basePath: import.meta.dirname,
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js'], //包含不在tsconfig中的文件,测试下来必须在根项目下指定才行，多项目都配置此参数会冲突
        },
        tsconfigRootDir: import.meta.dirname,
        // or, in CommonJS, __dirname
      },
    },
  },
);

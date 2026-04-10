import { defineConfig } from 'eslint/config';
import config from '../../eslint.config.base.js';

export default defineConfig(
  config,
  {
    ignores: ['node_modules/**', 'dist/**', 'test/**', 'jest.*', 'template/**', '.prettierrc.js', 'eslint.config.js', 'tsdown.config.js'],
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        // or, in CommonJS, __dirname
      },
    },
  },
);

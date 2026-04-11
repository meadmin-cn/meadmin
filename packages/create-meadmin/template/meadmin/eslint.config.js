import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginNode from 'eslint-plugin-node';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
export default defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/test/**',
      '**/jest.**',
      '**/.prettierrc.js',
      '**/bin/*.js',
      'commitlint.config.cjs',
      'eslint.config.js',
      '**/lint-staged.config.js',
      '**/tsdown.config.js',
      'packages/midway-vite-view/example/**', //忽略 midway-vite-view包示例文件
      '**/template/**', //忽略模板文件
      'view/**', //忽略校验，view前端代码单独使用自己规则进行校验
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    rules: {
      'block-scoped-var': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
      'eol-last': 'error',
      'prefer-arrow-callback': 'error',
      'no-constant-condition': 'off',
      'no-process-exit': 'off',
      'no-trailing-spaces': 'error',
      'quotes': ['warn', 'single', { avoidEscape: true }],
    },
  },
  {
    files: ['**/*.js', '**/*.ts'],
    plugins: {
      node: eslintPluginNode,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-warning-comments': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      'node/no-missing-import': 'off',
      'node/no-empty-function': 'off',
      'node/no-unsupported-features/es-syntax': 'off',
      'node/no-missing-require': 'off',
      'node/shebang': 'off',
      'no-dupe-class-members': 'off',
      'require-atomic-updates': 'off',
    },
  },
  {
    name: 'meadmin',
    basePath: import.meta.dirname,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js', 'index.d.ts'], //包含不在tsconfig中的文件,测试下来必须在根项目下指定才行，多项目都配置此参数会冲突
        },
        tsconfigRootDir: import.meta.dirname,
        // or, in CommonJS, __dirname
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: false,//禁用报告忽略注释
    },
  },

  eslintConfigPrettier, //移除与Prettier冲突的规则
);

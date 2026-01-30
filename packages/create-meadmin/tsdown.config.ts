import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  dts: true,
  target: 'node20',
  minify: true,
  inlineOnly: false as const,
  fixedExtension: false,
});

import { defineConfig } from 'tsdown';
export default defineConfig({
  entry: ['src/index.ts', 'src/preview.ts', 'src/style.ts'],
  dts: true,
  target: 'node20',
  minify: false,
  inlineOnly: false,
  fixedExtension: false,
});

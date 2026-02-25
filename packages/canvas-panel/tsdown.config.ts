import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: true,
  exports: {
    customExports: (exports) => {
      exports['./dist/index.iife.js'] = exports['./dist/index.iife.js'];
      return exports;
    },
  },
  entry: ['./src/index.ts'],
  format: ['es', 'cjs'],
  name: 'CanvasPanel',
});

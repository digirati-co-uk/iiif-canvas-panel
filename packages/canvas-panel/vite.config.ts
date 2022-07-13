import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';

export default defineConfig({
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
    dedupe: ['preact', 'preact/compat'],
  },
  plugins: [preact({ devtoolsInProd: true }) as any],
  test: {
    environment: 'node',
    globals: true,
    deps: {
      fallbackCJS: true,
    },
  },
});

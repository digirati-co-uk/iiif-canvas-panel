import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
    dedupe: ['preact', 'preact/compat'],
  },
  test: {
    environment: 'node',
    globals: true,
    deps: {
      fallbackCJS: true,
    },
  },
});

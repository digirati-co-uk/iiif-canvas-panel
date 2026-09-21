import { defineConfig } from 'vitest/config';
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: { dedupe: ['react', 'react-reconciler', '@atlas-viewer/atlas', 'react-iiif-vault'] },
  test: { environment: 'node', globals: true, deps: { fallbackCJS: true } },
});

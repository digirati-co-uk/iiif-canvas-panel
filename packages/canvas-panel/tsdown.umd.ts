import { defineConfig } from 'tsdown';

export default defineConfig({
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat',
  },
  treeshake: true,
  entry: ['./src/index.ts'],
  format: ['iife'],
  clean: false,
  name: 'CanvasPanel',
  external: ['react-reconciler'],
  noExternal: [
    'preact',
    'react-dom/client',
    'react-iiif-vault',
    'preact/jsx-runtime',
    'preact/compat',
    '@atlas-viewer/atlas',
    '@iiif/helpers',
    'react-error-boundary',
    '@atlas-viewer/iiif-image-api',
    '@iiif/helpers/annotation-targets',
    '@iiif/helpers/vault',
    '@iiif/helpers/thumbnail',
    '@iiif/helpers/events',
    '@iiif/helpers/styles',
    '@iiif/helpers/vault/actions',
    '@iiif/helpers/image-service',
    '@iiif/helpers/painting-annotations',
    '@iiif/helpers/i18n',
    'preact/hooks',
  ],
  minify: false,
  define: {
    'import.meta': '{}',
    'process.env.NODE_ENV': '"production"',
  },
  outputOptions: {
    name: 'CanvasPanel',
  },
});

import { defineConfig } from 'tsdown';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const preact = dirname(createRequire(import.meta.url).resolve('preact/package.json'));
const compat = join(preact, 'compat/dist/compat.module.js');

export default defineConfig({
  alias: {
    // Match the existing manual Atlas renderer used by Vite until the React migration.
    'react-reconciler': fileURLToPath(new URL('./src/reconciler-patch.ts', import.meta.url)),
    // Pin one Preact module graph for both ESM and CommonJS dependencies.
    'react/jsx-runtime': join(preact, 'jsx-runtime/dist/jsxRuntime.module.js'),
    'react-dom/client': compat,
    'react-dom': compat,
    react: compat,
    'preact/compat': compat,
    'preact/hooks': join(preact, 'hooks/dist/hooks.module.js'),
    'preact/jsx-runtime': join(preact, 'jsx-runtime/dist/jsxRuntime.module.js'),
    preact: join(preact, 'dist/preact.module.js'),
  },
  treeshake: true,
  entry: ['./src/index.ts'],
  format: ['iife'],
  clean: false,
  name: 'CanvasPanel',
  noExternal: [
    'react-reconciler',
    /^@iiif\/(helpers|parser)(\/|$)/,
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

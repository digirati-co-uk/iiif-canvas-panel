import preact from '@preact/preset-vite';

export const defaultExternal = [
  '@atlas-viewer/atlas',
  '@atlas-viewer/iiif-image-api',
  '@iiif/presentation-2',
  '@iiif/presentation-3',
  '@iiif/helpers/vault',
  '@iiif/helpers',
  '@preact/compat',
  '@react-hook/media-query',
  'preact',
  'react-error-boundary',
  'react-iiif-vault',
  'react-dom/client',
];

/**
 * @param options {{ external: string[]; entry: string; name: string; globalName: string; outDir?: string; globals: Record<string, string> }}
 */
export function defineConfig(options) {
  return {
    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
        'react-dom/client': 'preact/compat',
      },
    },
    build: {
      sourcemap: true,
      outDir: options.outDir || `dist/${options.name}`,
      lib: {
        entry: options.entry,
        name: options.globalName,
        formats: options.globalName ? ['umd'] : ['es', 'cjs'],
        fileName: (format) => {
          if (format === 'umd') {
            return `index.umd.js`;
          }
          if (format === 'es') {
            return `esm/${options.name}.mjs`;
          }
          return `${format}/${options.name}.js`;
        },
      },
      plugins: [preact({ devtoolsInProd: true })].filter(Boolean),
      rollupOptions: {
        treeshake: true,
        external: options.external,
        output: {
          globals: options.globals,
          inlineDynamicImports: !!options.globalName,
        },
      },
    },
  };
}

import { defaultExternal, defineConfig } from './base-config.mjs';
import { build } from 'vite';
import chalk from 'chalk';

(async () => {
  // Main UMD build.
  buildMsg('UMD');
  await build(
    defineConfig({
      entry: `src/index.ts`,
      name: 'index',
      outDir: 'dist',
      globalName: 'CanvasPanel',
    })
  );

  buildMsg('Libraries');
  await build(
    defineConfig({
      entry: `src/index.ts`,
      name: 'index',
      outDir: 'dist/bundle',
      external: [...defaultExternal],
    })
  );

  // => Need to wait for Preact support for streams.
  // buildMsg('Node Libraries');
  // await build(
  //   defineConfig({
  //     entry: `src/index-node.ts`,
  //     name: 'index',
  //     outDir: 'dist/node',
  //     external: [
  //       '@atlas-viewer/iiif-image-api',
  //       '@iiif/presentation-2',
  //       '@iiif/presentation-3',
  //       '@iiif/vault',
  //       '@iiif/vault-helpers',
  //       '@preact/compat',
  //       '@react-hook/media-query',
  //       'preact',
  //       'preact/compat',
  //       'react-error-boundary',
  //     ],
  //   })
  // );

  console.log('')


  function buildMsg(name) {
    console.log(chalk.grey(`\n\nBuilding ${chalk.blue(name)}\n`));
  }
})();

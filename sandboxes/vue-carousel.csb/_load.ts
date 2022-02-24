import { SandpackProps } from "@codesandbox/sandpack-react";
import { parseFiles } from "@site/Sandbox";

const config: SandpackProps = {
  // @ts-ignore
  files: parseFiles(require.context('!!raw-loader!./', true, /\.(ts|tsx|js|html|css|vue)$/)),
  template: 'vue3',
  options: {
    openPaths: [
      '/components/ManifestThumbnailList.vue',
      '/components/CanvasThumbnail.vue',
      '/components/IIIFCanvas.vue',
      '/components/Manifest.vue',
    ],
    activePath: '/components/ManifestThumbnailList.vue',
    wrapContent: false,
    editorHeight: 513,
    showTabs: false,
    showLineNumbers: true,
    autorun: true,
    editorWidthPercentage: 50,
  },
  customSetup: {
    dependencies: require('./package.json').dependencies,
  }
};

export default config;

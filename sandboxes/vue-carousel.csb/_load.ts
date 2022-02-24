import { SandpackProps } from "@codesandbox/sandpack-react";
import { parseFiles } from "@site/Sandbox";

const config: SandpackProps = {
  // @ts-ignore
  files: parseFiles(require.context('!!raw-loader!./', true, /\.(ts|tsx|js|html|css|vue)$/)),
  template: 'vue3',
  options: {
    openPaths: [
      '/src/components/ManifestThumbnailList.vue',
      '/src/components/CanvasThumbnail.vue',
    ],
    activePath: '/src/components/ManifestThumbnailList.vue',
    wrapContent: false,
    editorHeight: 513,
    showTabs: true,
    showLineNumbers: true,
    autorun: true,
    editorWidthPercentage: 50,
  },
  customSetup: {
    dependencies: require('./package.json').dependencies,
  }
};

export default config;

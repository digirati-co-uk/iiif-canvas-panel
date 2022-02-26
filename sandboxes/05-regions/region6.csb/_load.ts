import { SandpackProps } from "@codesandbox/sandpack-react";
import { parseFiles } from "@site/Sandbox";

const config: SandpackProps = {
  // @ts-ignore
  files: parseFiles(require.context('!!raw-loader!./', true, /\.(ts|tsx|js|html|css)$/)),
  template: 'vanilla',
  options: {
    openPaths: ['/src/index.js', '/index.html'],
    activePath: '/src/index.js',
    wrapContent: false,
    editorHeight: 513,
    showTabs: true,
    showLineNumbers: false,
    autorun: false,
    editorWidthPercentage: 60,
  },
  customSetup: {
    dependencies: require('./package.json').dependencies,
  }
};

export default config;

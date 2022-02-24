import { SandpackProps } from "@codesandbox/sandpack-react";
import { parseFiles } from "@site/Sandbox";

const config: SandpackProps = {
  // @ts-ignore
  files: parseFiles(require.context('!!raw-loader!./', true, /\.(ts|tsx|js|html|css)$/)),
  template: 'react',
  options: {
    openPaths: ['/App.js'],
    activePath: '/App.js',
    wrapContent: false,
    editorHeight: 513,
    showTabs: false,
    showLineNumbers: true,
    autorun: true,
    editorWidthPercentage: 60,
  },
  customSetup: {
    dependencies: require('./package.json').dependencies,
    environment: 'create-react-app',
  }
};

export default config;

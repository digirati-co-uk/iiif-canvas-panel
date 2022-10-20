import { SandpackProps } from "@codesandbox/sandpack-react";
import { parseFiles } from "@site/Sandbox";

const config: SandpackProps = {
  // @ts-ignore
  files: parseFiles(
    require.context("!!raw-loader!./", true, /\.(ts|tsx|js|html|css)$/)
  ),
  template: "vanilla",
  options: {
    openPaths: ["/index.html", "/src/index.js"],
    activePath: "/index.js",
    wrapContent: false,
    editorHeight: 700,
    showTabs: true,
    showLineNumbers: false,
    autorun: true,
    editorWidthPercentage: 40,
  },
  customSetup: {
    dependencies: require("./package.json").dependencies,
  },
};

export default config;

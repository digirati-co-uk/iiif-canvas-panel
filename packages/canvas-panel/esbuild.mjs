import process from 'process';
import esbuild from "esbuild";
import path from 'path';

const preactCompatPlugin = {
  name: "preact-compat",
  setup(build) {
    const preactCompat = path.join(process.cwd(), "node_modules", "preact", "compat", "dist", "compat.module.js");

    build.onResolve({filter: /^(react-dom|react)$/}, args => {
      return {path: preactCompat};
    });

    const preactRuntime = path.join(process.cwd(), "node_modules", "preact", "jsx-runtime", "dist", "jsxRuntime.module.js");

    build.onResolve({filter: /^(react\/jsx-runtime)$/}, args => {
      return {path: preactRuntime};
    });

    const preact = path.join(process.cwd(), "node_modules", "preact", "dist", "preact.module.js");

    build.onResolve({filter: /^(preact)$/}, args => {
      return {path: preact};
    });

    const nanoid = path.join(process.cwd(), "node_modules", "nanoid", "index.browser.js");

    build.onResolve({filter: /^(nanoid)$/}, args => {
      return {path: nanoid};
    });
  }
}

esbuild.build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/bundle.js",
  plugins: [preactCompatPlugin],
  bundle: true,
  minify: process.argv.indexOf('--dev') === -1,
  sourcemap: true,
  target: ["chrome58"],
  external: [],
  jsxFactory: 'h',
  jsxFragment: 'Fragment',

  watch: process.argv.indexOf('--watch') !== -1,
});

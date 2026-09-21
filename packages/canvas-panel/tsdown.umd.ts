import { defineConfig } from "tsdown";
const standalone = defineConfig({
  treeshake: true,
  entry: ["./src/index.ts"],
  format: ["iife"],
  clean: false,
  name: "CanvasPanel",
  css: { fileName: "index.css" },
  deps: {
    alwaysBundle: [
      /^react($|\/)/,
      /^react-reconciler($|\/)/,
      /^react-iiif-vault($|\/)/,
      /^@atlas-viewer\//,
      /^@iiif\//,
      "react-error-boundary",
    ],
  },
  minify: false,
  define: { "import.meta": "{}", "process.env.NODE_ENV": '"production"' },
  outputOptions: { name: "CanvasPanel" },
});

export default defineConfig([
  standalone,
  {
    ...standalone,
    entry: { "react-global": "./src/index.ts" },
    deps: {
      alwaysBundle: [
        /^react\//,
        /^react-reconciler($|\/)/,
        /^react-iiif-vault($|\/)/,
        /^@atlas-viewer\//,
        /^@iiif\//,
        "react-error-boundary",
      ],
      neverBundle: ["react"],
    },
    outputOptions: {
      name: "CanvasPanel",
      globals: { react: "React" },
      // The bundled reconciler has CommonJS React imports as well as ESM imports.
      // Keep this resolver inside the IIFE; no global require or extra runtime is needed.
      intro:
        'const require = (id) => { if (id === "react") return globalThis.React; throw new Error("Unexpected external module: " + id); };',
    },
  },
]);

import { defineConfig } from "tsdown";
export default defineConfig({
  treeshake: true,
  entry: ["./src/index.ts"],
  format: ["iife"],
  clean: false,
  name: "CanvasPanel",
  noExternal: [
    /^react($|\/)/,
    /^react-reconciler($|\/)/,
    /^react-iiif-vault($|\/)/,
    /^@atlas-viewer\//,
    /^@iiif\//,
    "react-error-boundary",
  ],
  minify: false,
  define: { "import.meta": "{}", "process.env.NODE_ENV": '"production"' },
  outputOptions: { name: "CanvasPanel" },
});

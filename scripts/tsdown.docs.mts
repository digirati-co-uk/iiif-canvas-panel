import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./docs-helpers.ts"],
  outDir: "../.docs-runtime",
  format: "iife",
  name: "CanvasPanelHelpers",
  outputOptions: { name: "CanvasPanelHelpers" },
  deps: { alwaysBundle: [/.*/] },
  define: { "process.env.NODE_ENV": '"production"' },
});

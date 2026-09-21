import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  exports: false,
  entry: ["./src/index.ts"],
  format: ["es", "cjs"],
  name: "CanvasPanel",
  css: { fileName: "index.css" },
});

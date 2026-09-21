import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  exports: false,
  entry: ["./src/index.ts", "./src/elements.ts", "./src/react.tsx"],
  format: ["es", "cjs"],
  name: "CanvasPanel",
  css: { fileName: "index.css" },
});

import { defineConfig } from "vitest/config";
export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    dedupe: ["react", "react-reconciler", "@atlas-viewer/atlas", "react-iiif-vault"],
  },
  test: { environment: "node", globals: true },
});

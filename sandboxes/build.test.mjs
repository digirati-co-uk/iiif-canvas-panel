import assert from "node:assert/strict";
import { test } from "node:test";
import { collectExamples, exportProject, validatePackageSpec } from "./build.mjs";

test("every example exports the same source with a reproducible package selection", async () => {
  const examples = await collectExamples();
  assert.equal(new Set(examples.map((example) => example.id)).size, examples.length);
  assert(examples.length >= 38);
  const preview = "https://pkg.pr.new/digirati-co-uk/iiif-canvas-panel/@digirati/canvas-panel-web-components@abcdef1";
  for (const example of examples) {
    assert(example.files["index.html"].includes('type="module"'), example.id);
    const project = exportProject(example, validatePackageSpec(preview));
    assert.equal(
      JSON.parse(project.files["package.json"]).dependencies["@digirati/canvas-panel-web-components"],
      preview,
    );
    assert.equal(project.files["index.html"], example.files["index.html"]);
    const local = exportProject(example, "workspace", {
      "dist/index.mjs": "// built library",
      "dist/index.d.mts": "// declarations",
    });
    assert.equal(local.files["canvas-panel/dist/index.d.mts"], "// declarations");
    assert.equal(
      JSON.parse(local.files["package.json"]).dependencies["@digirati/canvas-panel-web-components"],
      "file:./canvas-panel",
    );
  }
  assert.throws(() => validatePackageSpec("https://pkg.pr.new/package@123"));
  assert.throws(() => validatePackageSpec("latest"));
});

test("Twoslash resolves real example types, ID assertions, sibling files and the selected package", async () => {
  const { createExampleHighlighter } = await import("./highlight.mjs");
  const { mkdtemp, writeFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const path = await import("node:path");
  const root = path.dirname(new URL(import.meta.url).pathname);
  const highlighter = await createExampleHighlighter(path.resolve(root, "../packages/canvas-panel"));
  const examples = await collectExamples();
  try {
    for (const [id, file, expected] of [
      ["intro-script", "src/index.ts", "CanvasPanelElement.setCanvas(id: string): void"],
      ["user-events", "src/index.js", "CanvasPanelElement.zoomBy"],
      ["react-choices-example", "App.tsx", "CanvasPanelElement.makeChoice"],
      ["react-choices-example", "index.tsx", "JSX.Element"],
      ["vue-3-carousel", "src/App.vue", "Vault"],
    ]) {
      const example = examples.find((item) => item.id === id);
      assert(example, id);
      const html = highlighter.highlight(example, path.join(root, example.path))[file];
      assert(html.includes(expected), `${id}/${file}: ${expected}`);
      assert(html.includes('tabindex="0"'), "Types must be keyboard accessible");
    }
    const example = examples.find((item) => item.id === "intro-script");
    assert.throws(() =>
      highlighter.highlight(
        { ...example, files: { "invalid.ts": "const value: number = 'wrong';" } },
        path.join(root, example.path),
      ),
    );
  } finally {
    highlighter.dispose();
  }
  const directory = await mkdtemp(path.join(tmpdir(), "example-types-"));
  const selected = await createExampleHighlighter(directory);
  try {
    await writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ name: "@digirati/canvas-panel-web-components", types: "preview.d.ts" }),
    );
    await writeFile(path.join(directory, "preview.d.ts"), 'export declare const version: "preview-fixture";');
    const html = selected.highlight(
      {
        id: "preview",
        highlights: {},
        files: { "index.ts": 'import { version } from "@digirati/canvas-panel-web-components";\nversion;' },
      },
      root,
    )["index.ts"];
    assert(html.includes("preview-fixture"), "Types must come from the selected package, not the workspace");
  } finally {
    selected.dispose();
    await rm(directory, { recursive: true, force: true });
  }
});

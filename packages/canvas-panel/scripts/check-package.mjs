import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { createRequire, isBuiltin } from "node:module";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const pkg = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
for (const format of ["import", "require"]) {
  const entry = pkg.exports["."][format];
  await access(new URL(entry.default, root));
  await access(new URL(entry.types, root));
  const declarations = await readFile(new URL(entry.types, root), "utf8");
  assert(!declarations.includes(".build/types/"), "Declarations must use public dependency exports");
}
await access(new URL(pkg.types, root));
await access(new URL(pkg.exports["./dist/index.css"], root));
await access(new URL(pkg.exports["./dist/index.iife.js"], root));

const esm = await import(new URL(pkg.exports["."].import.default, root));
const cjs = createRequire(import.meta.url)(fileURLToPath(new URL(pkg.exports["."].require.default, root)));
assert.equal(typeof esm.AnnotationDisplay, "function");
assert.equal(typeof cjs.AnnotationDisplay, "function");
console.log("ESM, CommonJS, declaration paths and legacy script path resolve.");

// Follow the shipped entry graphs, including transitive chunks and dependencies.
const forbidden = /^(?:react-dom|preact|@preact|@floating-ui|polygon-editor)(?:\/|$)|^@atlas-viewer\/atlas$/;
const seen = new Set();
async function inspect(file) {
  if (seen.has(file) || /\.(json|css)$/.test(file)) return;
  seen.add(file);
  const source = await readFile(file, "utf8");
  for (const { fileName: specifier } of ts.preProcessFile(source, true, true).importedFiles) {
    if (["exports", "require", "module"].includes(specifier) || isBuiltin(specifier)) continue;
    assert(!forbidden.test(specifier), `${file} imports forbidden runtime ${specifier}`);
    await inspect(createRequire(file).resolve(specifier));
  }
}
for (const format of ["import", "require"])
  await inspect(fileURLToPath(new URL(pkg.exports["."][format].default, root)));
const script = await readFile(new URL(pkg.exports["./dist/index.iife.js"], root), "utf8");
assert(!/node_modules\/(?:react-dom|preact|@preact)\//.test(script), "Standalone script embeds an old DOM runtime");
console.log("React/Atlas scene dependency graphs contain no React DOM, Preact or editor runtime.");

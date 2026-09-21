import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
for (const format of ['import', 'require']) {
  const entry = pkg.exports['.'][format];
  await access(new URL(entry.default, root));
  await access(new URL(entry.types, root));
  const declarations = await readFile(new URL(entry.types, root), 'utf8');
  assert(!declarations.includes('.build/types/'), 'Declarations must use public dependency exports');
}
await access(new URL(pkg.types, root));
await access(new URL(pkg.exports['./dist/index.iife.js'], root));

const esm = await import(new URL(pkg.exports['.'].import.default, root));
const cjs = createRequire(import.meta.url)(fileURLToPath(new URL(pkg.exports['.'].require.default, root)));
assert.equal(typeof esm.AnnotationDisplay, 'function');
assert.equal(typeof cjs.AnnotationDisplay, 'function');
console.log('ESM, CommonJS, declaration paths and legacy script path resolve.');

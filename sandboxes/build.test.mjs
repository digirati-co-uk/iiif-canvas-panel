import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  collectExamples,
  exportProject,
  validatePackageSpec,
} from './build.mjs';

test('every example exports the same source with a reproducible package selection', async () => {
  const examples = await collectExamples();
  assert.equal(
    new Set(examples.map((example) => example.id)).size,
    examples.length,
  );
  assert(examples.length >= 38);
  const preview =
    'https://pkg.pr.new/digirati-co-uk/iiif-canvas-panel/@digirati/canvas-panel-web-components@abcdef1';
  for (const example of examples) {
    assert(example.files['index.html'].includes('type="module"'), example.id);
    const project = exportProject(example, validatePackageSpec(preview));
    assert.equal(
      JSON.parse(project.files['package.json']).dependencies[
        '@digirati/canvas-panel-web-components'
      ],
      preview,
    );
    assert.equal(project.files['index.html'], example.files['index.html']);
    const local = exportProject(example, 'workspace', {
      'dist/index.mjs': '// built library',
      'dist/index.d.mts': '// declarations',
    });
    assert.equal(
      local.files['canvas-panel/dist/index.d.mts'],
      '// declarations',
    );
    assert.equal(
      JSON.parse(local.files['package.json']).dependencies[
        '@digirati/canvas-panel-web-components'
      ],
      'file:./canvas-panel',
    );
  }
  assert.throws(() => validatePackageSpec('https://pkg.pr.new/package@123'));
  assert.throws(() => validatePackageSpec('latest'));
});

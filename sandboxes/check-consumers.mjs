import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { collectExamples, exportProject } from './build.mjs';

// Test exactly the project files supplied to StackBlitz, outside the workspace.
const snapshot = JSON.parse(
  await readFile(
    new URL('../.docs-examples/examples/package.json', import.meta.url),
    'utf8',
  ),
);
const catalog = JSON.parse(
  await readFile(
    new URL('../.docs-examples/catalog.json', import.meta.url),
    'utf8',
  ),
);
const spec =
  catalog.package === 'Local workspace build' ? 'workspace' : catalog.package;
const examples = await collectExamples();
const directory = await mkdtemp(path.join(tmpdir(), 'canvas-panel-examples-'));
try {
  for (const id of [
    'intro-script',
    'react-choices-example',
    'vue-3-carousel',
  ]) {
    const example = examples.find((item) => item.id === id);
    const project = exportProject(example, spec, snapshot);
    const cwd = path.join(directory, id);
    for (const [name, code] of Object.entries(project.files)) {
      await mkdir(path.dirname(path.join(cwd, name)), { recursive: true });
      await writeFile(path.join(cwd, name), code);
    }
    execFileSync(
      'npm',
      ['install', '--ignore-scripts', '--no-audit', '--no-fund'],
      { cwd, stdio: 'inherit' },
    );
    execFileSync('npm', ['run', 'build'], { cwd, stdio: 'inherit' });
    if (JSON.parse(project.files['package.json']).scripts.typecheck)
      execFileSync('npm', ['run', 'typecheck'], { cwd, stdio: 'inherit' });
    console.log(`Clean exported consumer passed: ${id}`);
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}

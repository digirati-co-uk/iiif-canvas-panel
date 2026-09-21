import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

await yargs(hideBin(process.argv))
  .command('create <name>', 'Create a documentation example', () => {}, async ({ name }) => {
    if (!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(name)) throw new Error('Use lowercase names separated by hyphens or folders.');
    const directory = path.resolve('sandboxes', `${name}.csb`);
    await mkdir(path.dirname(directory), { recursive: true });
    await mkdir(directory); // Refuse to overwrite an existing example.
    await cp('sandboxes/example-sandbox.csb', directory, {
      recursive: true, filter: (source) => !['node_modules', 'dist'].includes(path.basename(source)),
    });
    const pkg = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
    pkg.name = name.replaceAll('/', '-');
    pkg.description = name.split('/').pop().replaceAll('-', ' ');
    await writeFile(path.join(directory, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
    await writeFile(path.join(directory, 'example.json'), JSON.stringify({
      title: pkg.description, group: 'Examples', framework: 'vanilla', files: ['index.html', 'src/index.js', 'src/styles.css'],
    }, null, 2) + '\n');
    console.log(`Created ${directory}\nRun pnpm install, then pnpm dev.\n\nimport { Example } from '@site/Example';\n\n<Example id="${pkg.name}" />`);
  })
  .demandCommand(1)
  .parseAsync();

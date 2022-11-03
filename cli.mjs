import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';

yargs(hideBin(process.argv))
  .command('create <name>', 'Create new sandbox', () => {
  }, async (argv) => {

    const pathToProject = path.resolve('sandboxes', argv.name + '.csb');
    const pkg = path.resolve(pathToProject, 'package.json');

    if (existsSync(pkg)) {
      throw new Error('Already exists');
    }

    console.log('Creating project... ' + argv.name)

    await fs.mkdir(pathToProject);
    await Promise.all([
      fs.writeFile(pkg, JSON.stringify({
          "name": argv.name,
          "description": `${argv.name} sandbox`,
          "main": "./src/index.js",
          "dependencies": {
            "@digirati/canvas-panel-web-components": "*"
          }
        }, null, 2
      )),
      fs.writeFile(path.resolve(pathToProject, 'index.html'), `<!-- HTML web components here. -->`.trim()),
      fs.writeFile(path.resolve(pathToProject, '_load.ts'), getVanillaMain()),
      fs.mkdir(path.resolve(pathToProject, 'src')).then(() =>
        Promise.all([
          fs.writeFile(path.resolve(pathToProject, 'src', 'index.js'), [
            `import '@digirati/canvas-panel-web-components';`,
            `import './styles.css';`
          ].join('\n') + '\n'),
          fs.writeFile(path.resolve(pathToProject, 'src', 'styles.css'), '')
        ])
      ),
    ])


    const varName = argv.name.replace('-', '_');
    console.log('done! You can now use this in your project.');
    console.log('');
    console.log(`
  import ${varName} from '@site/sandboxes/${argv.name}.csb/_load';
  import { Sandbox } from '@site/Sandbox';
  
  <Sandbox project={${varName}} />
    `);

  })
  .version('1.0.0')
  .demandCommand(1)
  .parse()


function getVanillaMain() {
  return `import { SandpackProps } from "@codesandbox/sandpack-react";
import { parseFiles } from "@site/Sandbox";

const config: SandpackProps = {
  // @ts-ignore
  files: parseFiles(require.context('!!raw-loader!./', true, /\\.(ts|tsx|js|html|css)$/)),
  template: 'vanilla',
  options: {
    openPaths: ['/index.html'],
    activePath: '/index.html',
    wrapContent: false,
    editorHeight: 513,
    showTabs: false,
    showLineNumbers: false,
    autorun: true,
    editorWidthPercentage: 60,
  },
  customSetup: {
    dependencies: require('./package.json').dependencies,
  }
};

export default config;
`;
}

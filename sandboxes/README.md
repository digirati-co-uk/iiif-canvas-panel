# Documentation examples

Examples are Vite projects. The `.csb` directory suffix is retained to avoid
moving all source paths; CodeSandbox is no longer involved.

```sh
pnpm sandbox create regions/my-example
pnpm install
pnpm dev
```

Add the example to a docs page:

```mdx
import { Example } from '@site/Example';

<Example id="regions-my-example" />
```

`example.json` holds the title, optional description, group, framework, and the
source files to show first. Optional `height`, `autorun: false`, and
`highlights` (e.g. `{ "src/index.ts": "5-12" }`) control presentation. Use
`layout="split"` on an example for a wide-screen side-by-side layout. The
default puts the preview above the code. All project files remain available and
copyable.

Run an individual project with `pnpm --filter <package-name> start`. Keep its
imports, package.json and Vite entry point runnable; there is no special docs
runtime in the source. React examples use React 19 independently of Docusaurus's
React 17. Vue's Vite config recognises hyphenated custom elements.

`pnpm build:examples` collects the source, builds all preview pages, and writes
`.docs-examples/`. The docs render source during static generation and lazy-load
the preview iframe. StackBlitz is loaded only when requested. New-tab editing is
available in every browser; inline WebContainer editing is offered in Chromium
only when the docs host is cross-origin isolated. The current static hosting
setup uses new-tab editing. Enabling inline editing requires appropriate
[COOP/COEP headers](https://webcontainers.io/guides/configuring-headers) on the
host and testing external IIIF resources under those restrictions; the SDK
option alone is insufficient. The separate launcher page avoids popup blocking
while package files are fetched. Returning from inline editing discards those
edits; “Open original” exports the original repository example. Fork in
StackBlitz to save an edited project.

## Package selection

The default is the local workspace build. StackBlitz exports include a snapshot
of its built JS, CSS, declarations and package metadata as a real `file:`
package. Remote dependencies, including transitive pkg.pr.new URLs, install
normally. No remote iframe needs to fetch localhost, and no synthetic
node_modules are used.

Set `EXAMPLE_PACKAGE` to an **exact release version** or a **full commit-pinned
pkg.pr.new URL** to build the inline previews and editor exports against that
package instead. Obtain the URL from successful publication; do not guess one.

```sh
EXAMPLE_PACKAGE=1.0.74 pnpm build:examples
pnpm exec docusaurus build
```

The selected package is installed in the ignored `.example-consumer/` directory.
The normal workspace manifests and lockfile are not rewritten. Re-run
`pnpm build:examples` without the variable to return to the local package. The
CI workflow publishes previews, then builds the documentation against the
returned commit URL and saves a documentation artifact. It also creates three
representative StackBlitz templates.

## Checks

```sh
pnpm build
pnpm test:examples          # project export validation and typed examples
pnpm test:example-packages  # clean npm installs/builds of the three exported projects
pnpm serve --port 3002
DOCS_URL=http://127.0.0.1:3002 pnpm test:example-ui
DOCS_URL=http://127.0.0.1:3002 EXAMPLE_BROWSER=webkit pnpm test:example-ui
```

Browser checks require the corresponding Playwright browser
(`pnpm exec playwright install chromium webkit`) and internet access to the IIIF
fixtures. Clean consumer checks need registry access. `pnpm test:demos` retains
the existing viewer checks.

The introductory TypeScript and React examples are strictly checked, including
negative checks for invalid methods, arguments and event payloads. Existing
JavaScript/Vue examples are compiled; they are not claimed to be fully
type-safe. Import `CanvasPanelElement` for refs and use
`document.querySelector('canvas-panel')` for an inferred DOM type. Call methods
after connection/`whenReady`; declarations do not imply that image or manifest
loading has finished. HTML attribute validation and a custom inline language
server are not part of this implementation.

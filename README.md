# Canvas Panel

This repository contains the Canvas Panel package and its Docusaurus
documentation. Use Node 22 and pnpm 10 (the version is pinned in
`package.json`).

Installing dependencies sets up the pre-commit hook to lint and format staged
files with Oxlint and Oxfmt. Run `pnpm lint` or `pnpm lint:fix` for linting, and
`pnpm fmt` or `pnpm fmt:check` for formatting.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` (also `pnpm start`) builds the local package, then runs:

- Documentation: http://127.0.0.1:3000
- Application playground: http://127.0.0.1:5173
- Deterministic rendering smoke test: http://127.0.0.1:5173/test/smoke.html

Package source changes rebuild the browser bundle and ESM package, then update
locally built example previews. Vite updates the application directly. Docs
changes reload through Docusaurus. Ctrl-C stops the development processes.

Examples use ordinary Vite projects with readable source and isolated inline
previews. Editing opens StackBlitz with the same source and package; local
exports include the current build and declarations. See
[the example authoring guide](sandboxes/README.md) for adding examples, package
previews and checks.

```sh
pnpm build               # package, examples, then production documentation
pnpm serve               # serve build/ locally
pnpm dev:docs            # docs only, after pnpm build:runtime and pnpm build:examples
pnpm dev:app             # application only
pnpm --filter @digirati/canvas-panel-web-components typecheck
pnpm --filter @digirati/canvas-panel-web-components test
```

The search plugin's Cheerio version is pinned to its compatible CommonJS
release; remove that override when upgrading Docusaurus and the search plugin
together.

Browser regression checks (with the docs server running):

```sh
pnpm exec playwright install chromium
pnpm test:docs
pnpm test:demos          # also checks React/Vue and navigation; needs internet
```

Use `DOCS_URL=http://127.0.0.1:3001` to check a production server. The check
verifies that the site serves the workspace bundle and exercises rendering,
default and updated dimensions, responsive sizing, zoom, and home inside
Docusaurus.

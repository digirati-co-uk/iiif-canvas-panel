# Canvas Panel

This repository contains the Canvas Panel package and its Docusaurus documentation.
Use Node 22 and pnpm 10 (the version is pinned in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` (also `pnpm start`) builds the local package, then runs:

- Documentation: http://127.0.0.1:3000
- Application playground: http://127.0.0.1:5173
- Deterministic rendering smoke test: http://127.0.0.1:5173/test/smoke.html

Package source changes rebuild the browser bundle and reload the docs, including
editable examples and standalone demos. Vite updates the application directly.
Docs changes reload through Docusaurus. Ctrl-C stops all three processes.
The docs use the workspace package, not a CDN release; the served bundle is
`/index.iife.js`, with `/index.css`. Sandpack compiles edited examples remotely,
so editable previews still require internet access. The local build is passed into
the preview as virtual files, including when running on localhost.

```sh
pnpm build               # package, example helpers, then production documentation
pnpm serve               # serve build/ locally
pnpm dev:docs            # docs only, after pnpm build:runtime
pnpm dev:app             # application only
pnpm --filter @digirati/canvas-panel-web-components typecheck
pnpm --filter @digirati/canvas-panel-web-components test
```

The current browser build retains the Preact/manual Atlas renderer while the v2
React reconciler work proceeds. Its renderer is isolated from Docusaurus React.
See [the v2 plan](V2-REVIEW-AND-PLAN.md) for the remaining migration.

The search plugin's Cheerio version is pinned to its compatible CommonJS release;
remove that override when upgrading Docusaurus and the search plugin together.

Browser regression checks (with the docs server running):

```sh
pnpm exec playwright install chromium
pnpm test:docs
pnpm test:demos          # also checks editable React/Vue and navigation; needs internet
```

Use `DOCS_URL=http://127.0.0.1:3001` to check a production server. The check verifies
that the site serves the workspace bundle and exercises rendering, default and
updated dimensions, responsive sizing, zoom, and home inside Docusaurus.

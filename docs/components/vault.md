---
sidebar_position: 5
---

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

# Vault

Instead of loading IIIF resources yourself, use Vault to load objects, then address them on the canvas via their IDs in Vault.

This allows Vault (rather than you as developer) to keep track of everything, to handle resource loading over HTTP, and normalise loaded IIIF to the Presentation 3.0 specification.

So not:

```html
<canvas-panel iiif-content="{..}"></canvas-panel>  <!-- don't assign an object -->
```

or 

```js
cp.canvas = {..}; // an actual canvas I might have pulled out of a manifest I fetched myself
```

but

```js
const vault = HyperionVault.globalVault();

vault.loadManifest("...");
// or
vault.load("..something that has a canvas *id* in it")
// then
cp.setCanvas(id)
```

:::info

The reasoning for pattern is to avoid loading states. When you render an image, there can be a cascade of loading: manifest, annotation lists, image service, tiles etc. 

This doesn't mean you can't pass in=memory objects to Canvas Panel - but you should pass them via the Vault. That ensures they are normalised and _tracked_.

```js
vault.load('id', { ..json });
```

> What if my json has a conflicting id?

Vault merges, so if you had a canvas with:

```json
{"id": "http://example.org/annotation-page-1", "type": "AnnotationPage"}
```

And then loaded it in and called:

```js
vault.load('http://example.org/annotation-page-1', { full json });
```

It would merge in the fully resolved - and the graph can continue from the canvas.


---
sidebar_position: 2
---

# Vault

Instead of loading IIIF resources yourself, use Vault to load objects, then address them on the canvas via their IDs in Vault.

This allows Vault (rather than you as developer) to keep track of everything, to handle resource loading, normalisation etc.

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
vault.loadManifest("...");
// or
vault.load("..something that has a canvas *id* in it")
// then
cp.setCanvas(id)
```

The reasoning for this is to avoid loading states. When you render an image, there is a cascade of time where we are loading, manifest, annotation lists, image service, time tiles etc. This gives a way for an end user to handle the loading, and then render the thing - or just pass an ID and wait, with default loading UI.

This doesn't mean you can't pass in memory objects to Canvas Panel - but you should pass them via the vault. That ensures they are normalised and tracked.

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


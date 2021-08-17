---
sidebar_position: 1
---

# Quick start

The most common scenario is simply rendering a Canvas. Most canvases live in Manifests rather than on their own on the web, so being able to say "show _this_ canvas in _that_ manifest" is a common pattern:

```html
<canvas-panel
   render="static"
   canvas-id="https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2"
   manifest-id="https://iiif.wellcomecollection.org/presentation/b18035723">
</canvas-panel>
```

> Show It!

This will render the canvas as a static image - like an image tag - _even if the canvas is a complex scene composed of several source images!_ Other render modes are introduced below. You can get default zooming behaviour by removing the `render` attribute, which enables the user to interact with the viewport through panning and zooming.

The `canvas-id` and `manifest-id` attributes are actually aliases for two more general purpose mechanisms for loading content into Canvas Panel:

```html
<canvas-panel
   iiif-content="https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2"
   partof="https://iiif.wellcomecollection.org/presentation/b18035723">
</canvas-panel>
```

The `iiif-content` attribute is here set to a Canvas `id`, and `partof` is the Manifest that the Canvas is found in (it could be omitted if the Canvas was de-referenceable). More generally:

* `iiif-content`: anything that identifies a canvas, or points at a canvas
* `partof`: anything that needs to be loaded in addition to locate that canvas.

`iiif-content` can take a Canvas id - but it can also take any value that is a valid [IIIF Content State](https://iiif.io/api/content-state/). So it could be a content state Annotation that points at a particular part of a Canvas, with a `partof` reference included in the Annotation (meaning that only the single `iiif-content` attribute is needed). This includes content states in encoded form, e.g., a stored bookmark or a search result linking into a viewer:

```html
<canvas-panel iiif-content="JTdCJTI.....EJTdE"></canvas-panel>
```

> Show It!

You can also work with the Canvas from script:

```html
<canvas-panel id="cp"></canvas-panel>
<script>
   const cp = document.getElementById("cp");
   cp.setAttribute("render", "responsive");
   const vault = HyperionVault.globalVault();
   await vault.loadManifest("https://iiif.wellcomecollection.org/presentation/b18035723");
   cp.setCanvas("https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2");
</script>  
```

> Show it!

The canvas-panel element and your code share a common instance of a [Vault](../../docs/components/vault): use this to load and manage IIIF resources, rather than passing them directly to the element as IIIF resources. Vault normalises all IIIF to 100% compliant IIIF Presentation 3, allowing you to take advantage of that specification's consistent model and JSON serialisation, and code directly against the version 3 specification, regardless of the source IIIF.

The above example rendered a [responsive image](../../docs/examples/responsive-image), using Canvas Panel defaults.

The most common render mode in applications is the default - `zoom`. This does not _require_ a tiled image source, and won't necessarily use one even if one is available - it depends how much space canvas-panel takes up on the page and the properties of the image service. 

```html
<canvas-panel class="quite-small"
   iiif-content="https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2"
   partof="https://iiif.wellcomecollection.org/presentation/b18035723">
</canvas-panel>
```

> Show it!
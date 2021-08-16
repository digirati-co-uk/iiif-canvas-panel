---
sidebar_position: 1
---

# Quick start

The most common scenario is simply rendering a Canvas. Most canvases live in Manifests rather than on their own on the web, so being able to say "show _this_ canvas in _that_ manifest" is a common pattern:

```html
<canvas-panel
   render="static"
   iiif-content="https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2"
   partof="https://iiif.wellcomecollection.org/presentation/b18035723">
</canvas-panel>
```

> Show It!

This will render the canvas as a static image - like an image tag - _even if the canvas is a complex scene composed of several source images!_ Other render modes are introduced below. You can get default zooming behaviour by removing the `render` attribute.

The `iiif-content` attribute is here set to a Canvas `id`, and `partof` is the Manifest that the Canvas is found in (it could be omitted if the Canvas was de-referenceable).

`iiif-content` can take a Canvas id - but it can also take any value that is a valid IIIF Content State. So it could be a content state Annotation that points at a particular part of a Canvas, with a `partof` reference included in the Annotation (meaning that only the single `iiif-content` attribute is needed). This includes content states in encoded form, e.g., a stored bookmark or a search result linking to 

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
   const vault = cp.vault;
   await vault.loadManifest("https://iiif.wellcomecollection.org/presentation/b18035723");
   cp.setCanvas("https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2");
</script>  
```

> Show it!

The canvas and your code share a common instance of a _Vault_: use this to load and manage IIIF resources rather than passing them directly to the Canvas Panel component as IIIF objects. This allows you to deal with multiple versions of IIIF. Vault normalises all IIIF to 100% compliant IIIF Presentation 3, allowing you to take advantage of that specification's consistent model and JSON serialisation.

The above example rendered a [responsive image](../../docs/examples/responsive-image), using Canvas Panel defaults.

The most common render mode is the default - deep zoom. This does not require a tiled image source, and won't necessarily use one even if one is available - it depends how much space canvas-panel takes up on the page and the properties of the image service. In general, this is the default mode that will give you familiar "viewer" behaviour:

```html
<canvas-panel
   iiif-content="https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2"
   partof="https://iiif.wellcomecollection.org/presentation/b18035723">
</canvas-panel>
```
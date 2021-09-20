---
sidebar_position: 1
---

# Quick start

## What is Canvas Panel?

Canvas Panel is a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that renders a IIIF Canvas and the annotations on it. If you already know what Canvases and Annotations are you are ready to get started. If not, [here's a brief introduction](../about) with links to more learning resources.

Canvas Panel is not a IIIF Viewer, like Mirador or Universal Viewer. It's not a full application - it's a component of _your_ application. On its own, Canvas Panel doesn't render a IIIF Manifest - but it can be used as the _rendering surface_ in any kind of IIIF application you want to build. It also provides a powerful API for drawing annotations on the canvas and responding to user interaction with the canvas.

You can see how to use Canvas Panel to build a _Manifest Viewer_ in some of the later application examples.

## How do I get Canvas Panel?

An easy way to try things out is to simply include a reference to Canvas Panel on (CDN).

```html
<html>
<head>
    <script src="https://cdn.js/....(example).../canvas-panel.js"></script>
</head>
<body>
    <h1>Canvas Panel</h1>
    <canvas-panel id="cp"></canvas-panel>
    <script>
        // drive canvas panel here...
    </script>
</body>
</html>
```

## Basic usage

The most common scenario is simply rendering a Canvas. Most canvases live in Manifests rather than on their own on the web, which means **"show _this_ canvas in _that_ manifest"** is a common pattern:

```html
<canvas-panel
   canvas-id="https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2"
   manifest-id="https://iiif.wellcomecollection.org/presentation/b18035723">
</canvas-panel>
```

> Show It!

This shows Canvas Panel loading a manifest, finding a particular Canvas, and rendering that Canvas with the familiar pan-and-zoom behaviour expected for IIIF image content. It will do this _even if the canvas is a complex scene composed of several source images!_ In this respect Canvas Panel is different from OpenSeadragon and Leaflet. In those libraries, your code would need to evaluate the canvas content and render it all manually. Canvas Panel understands IIIF Canvases natively, so you just give it a Canvas.

You can also render canvases as static images, without the pan and zoom behaviour:

```html
<canvas-panel
   render="static"
   canvas-id="https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2"
   manifest-id="https://iiif.wellcomecollection.org/presentation/b18035723">
</canvas-panel>
```

> Show It!

The addition of `render="static"` changes the behaviour of the component on the web page; now you can't zoom in. This becomes more useful when combined with other behaviours later.

### Getting content in

The `canvas-id` and `manifest-id` attributes are helper aliases for two more general purpose mechanisms for loading a Canvas into Canvas Panel:

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

> Inspect this content state in a content state decoder (TBC)

### Programming Canvas Panel

You can also work with the Canvas from script. This is more typical in client-side applications. The attribute-based approach is more useful in rendering IIIF content server-side. You can tell Canvas Panel to do the same thing as the attributes above like this:

```html
<canvas-panel id="cp"></canvas-panel>
<script>
   const cp = document.getElementById("cp");
   cp.setAttribute("render", "responsive"); // we've seen default (zoom) and static, here's another mode
   const vault = HyperionVault.globalVault(); // Vault simplifies access to IIIF resources
   await vault.loadManifest("https://iiif.wellcomecollection.org/presentation/b18035723");
   cp.setCanvas("https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2");
</script>  
```

> Show it!

## What is Vault?

By default, all `canvas-panel` elements on the page share a common instance of a [Vault](../../docs/components/vault). The Vault library is used to load and manage IIIF resources, rather than passing them directly to Canvas Panel as JSON blobs.

Under the hood, Vault manages the HTTP fetch operations and optimises internal storage of all the IIIF resources in use on a page. Vault normalises all IIIF to the Presentation 3 specification, allowing you to take advantage of a consistent programming interface regardless of the source IIIF.

In the code sample above, we rendered a [responsive image](../../docs/examples/responsive-image), using Canvas Panel defaults.


## What is Hyperion?

Vault is part of the Hyperion Framework, a library for working with IIIF. Both Vault and Canvas Panel are built on top of Hyperion. For most applications you can use the API of Canvas Panel directly, without having to use the wider Hyperion libraries. But they are there if you need them.


## Getting started with making a Viewer

One of the most common tasks is building _viewers_ - where we load a IIIF Manifest and allow the user to navigate around the different Canvases (views) within it. You can explore Canvas Panel's features in the docs, or go straight to [Building a Simple Viewer](../applications/simple-viewer) to follow along.


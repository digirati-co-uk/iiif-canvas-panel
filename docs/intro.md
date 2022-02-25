---
sidebar_position: 1
---

import introScript from '@site/sandboxes/00-intro/intro-script.csb/_load';
import { Sandbox } from '@site/Sandbox';

# Quick start

## What is Canvas Panel?

Canvas Panel is a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that renders a [IIIF Canvas](https://iiif.io/api/presentation/3.0/#53-canvas) and the annotations on it. If you already know what Canvases and Annotations are you are ready to get started. If not, [here's a brief introduction](../about) with links to more learning resources.

Canvas Panel is not a IIIF Viewer, like Mirador or Universal Viewer. It's not a full application - it's a component of _your_ application. On its own, Canvas Panel doesn't render a IIIF Manifest - but it can be used as the _rendering surface_ in any kind of IIIF application you want to build. You can see Canvas Panel used this way in some of the [demo applications](../docs/applications/simple-viewer). It also provides a powerful API for drawing annotations on the canvas and responding to user interaction with the canvas.

You can see how to use Canvas Panel to build a [Manifest Viewer](../../docs/applications/bookreader-viewer) in some of the later application examples.

## How do I get Canvas Panel?

An easy way to try things out is to simply include a reference to Canvas Panel on (CDN).

```html
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@latest"></script>
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
    canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
    manifest-id="https://digirati-co-uk.github.io/wunder.json">
</canvas-panel>
```

<canvas-panel
    canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
    manifest-id="https://digirati-co-uk.github.io/wunder.json">
</canvas-panel>

This shows Canvas Panel loading a manifest, finding a particular Canvas, and rendering that Canvas with the familiar pan-and-zoom behaviour expected for IIIF image content. It will do this _even if the canvas is a complex scene composed of several source images!_ In this respect Canvas Panel is different from OpenSeadragon and Leaflet. In those libraries, your code would need to evaluate the canvas content and render it all manually. Canvas Panel understands IIIF Canvases natively, so you just give it a Canvas.

It is like OpenSeadragon and Leaflet in that it renders a _viewport_, in which the canvas (or a part of it, if zoomed in) is visible.

You can also render the viewport statically, without the pan and zoom behaviour:

<!-- TODO: GH-56 -->
```html
<canvas-panel
    preset="static"
    canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
    manifest-id="https://digirati-co-uk.github.io/wunder.json">
</canvas-panel>
```

<canvas-panel
    preset="static"
    canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
    manifest-id="https://digirati-co-uk.github.io/wunder.json">
</canvas-panel>

The addition of `preset="static"` changes the behaviour of the component on the web page; now you can't zoom in. This becomes more useful when combined with other behaviours later.

You can also make Canvas Panel behave more like (but not quite the same as) a static image, on the page. Canvas Panel can do this responsively, with defaults:

```html
<canvas-panel
    preset="responsive"
    canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
    manifest-id="https://digirati-co-uk.github.io/wunder.json">
</canvas-panel>
```

<canvas-panel
    preset="responsive"
    canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
    manifest-id="https://digirati-co-uk.github.io/wunder.json">
</canvas-panel>

These behaviours are explained in more detail in [Responsive Images and rendering modes](../docs/examples/responsive-image).


Canvas Panel generally fills up the available width, with a default height. You can use this to adjust the size of canvas panel on the page:

```html
<div style={{ maxWidth: 400 }}>
  <div style={{ marginBottom: '10px' }}>
    <canvas-panel
      preset="responsive"
      canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
      manifest-id="https://digirati-co-uk.github.io/wunder.json">
    </canvas-panel>
  </div>
      
  <div style={{ marginBottom: '10px' }}>
    <canvas-panel
      preset="responsive"
      canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
      manifest-id="https://digirati-co-uk.github.io/wunder.json"
      region="466,2221,1612,450"
      exact-initial-image="true">
    </canvas-panel>
  </div>
</div>
```

<div style={{ maxWidth: 400 }}>
  <div style={{ marginBottom: '10px' }}>
    <canvas-panel
      preset="responsive"
      canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
      manifest-id="https://digirati-co-uk.github.io/wunder.json">
    </canvas-panel>
  </div>
      
  <div style={{ marginBottom: '10px' }}>
    <canvas-panel
      preset="responsive"
      canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
      manifest-id="https://digirati-co-uk.github.io/wunder.json"
      region="466,2221,1612,450"
      virtual-sizes="1612,450">
    </canvas-panel>
  </div>
</div>

The above examples use _presets_ - with the default being `zoom`. 

Note that the second of the two canvas panels above uses the `region` attribute to render just one part of the Canvas.

### Getting content in

The `canvas-id` and `manifest-id` attributes are helpers for a very common scenario for loading a canvas into Canvas Panel: when you know the manifest URL, and you know the ID of the canvas within it, but the canvas is not dereferenceable on its own.

More generally, you can use the `iiif-content` attribute, which accepts a _Content State_ - this allows any [IIIF Content State](https://iiif.io/api/content-state/) that references a Canvas, or part of a Canvas, to be used to initialise Canvas Panel.

```html
<canvas-panel
    iiif-content="JTdCJTB...[omitted for brevity]...MEElN0Q">
</canvas-panel>
```

<canvas-panel
  iiif-content="JTdCJTBEJTBBJTIwJTIwJTIyaWQlMjIlM0ElMjAlMjJodHRwcyUzQSUyRiUyRmRpZ2lyYXRpLWNvLXVrLmdpdGh1Yi5pbyUyRnd1bmRlciUyRmNhbnZhc2VzJTJGMSUyMiUyQyUwRCUwQSUyMCUyMCUyMnR5cGUlMjIlM0ElMjAlMjJDYW52YXMlMjIlMkMlMEQlMEElMjAlMjAlMjJwYXJ0T2YlMjIlM0ElMjAlNUIlN0IlMEQlMEElMjAlMjAlMjAlMjAlMjJpZCUyMiUzQSUyMCUyMmh0dHBzJTNBJTJGJTJGZGlnaXJhdGktY28tdWsuZ2l0aHViLmlvJTJGd3VuZGVyLmpzb24lMjIlMkMlMEQlMEElMjAlMjAlMjAlMjAlMjJ0eXBlJTIyJTNBJTIwJTIyTWFuaWZlc3QlMjIlMEQlMEElMjAlMjAlN0QlNUQlMEQlMEElN0Q"
/>


Examples of content states are bookmarks and search results. You can see what the content state used in the above example looks like in a [content state decoder](https://base64url.herokuapp.com/?iiif-content=JTdCJTBEJTBBJTIwJTIwJTIyaWQlMjIlM0ElMjAlMjJodHRwcyUzQSUyRiUyRmRpZ2lyYXRpLWNvLXVrLmdpdGh1Yi5pbyUyRnd1bmRlciUyRmNhbnZhc2VzJTJGMSUyMiUyQyUwRCUwQSUyMCUyMCUyMnR5cGUlMjIlM0ElMjAlMjJDYW52YXMlMjIlMkMlMEQlMEElMjAlMjAlMjJwYXJ0T2YlMjIlM0ElMjAlNUIlN0IlMEQlMEElMjAlMjAlMjAlMjAlMjJpZCUyMiUzQSUyMCUyMmh0dHBzJTNBJTJGJTJGZGlnaXJhdGktY28tdWsuZ2l0aHViLmlvJTJGd3VuZGVyLmpzb24lMjIlMkMlMEQlMEElMjAlMjAlMjAlMjAlMjJ0eXBlJTIyJTNBJTIwJTIyTWFuaWZlc3QlMjIlMEQlMEElMjAlMjAlN0QlNUQlMEQlMEElN0Q).

Content states can be used to point at any part of a Canvas:

<div style={{ maxWidth: 600 }}>
    <div style={{ marginBottom: '10px' }}>
      <canvas-panel
        preset="responsive"
        canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
        manifest-id="https://digirati-co-uk.github.io/wunder.json">
      </canvas-panel>
    </div>
    
    <div style={{ marginBottom: '10px' }}>
      <canvas-panel
        preset="responsive"
        iiif-content="JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmRpZ2lyYXRpLWNvLXVrLmdpdGh1Yi5pbyUyRnd1bmRlciUyRmNhbnZhc2VzJTJGMCUyM3h5d2glM0Q3NDQlMkMxMTM2JTJDMTAyNCUyQzEwMTAlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyQ2FudmFzJTIyJTJDJTIycGFydE9mJTIyJTNBJTVCJTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmRpZ2lyYXRpLWNvLXVrLmdpdGh1Yi5pbyUyRnd1bmRlci5qc29uJTIyJTJDJTIydHlwZSUyMiUzQSUyMk1hbmlmZXN0JTIyJTdEJTVEJTdE"
      />
    </div>
    
    <div style={{ marginBottom: '10px' }}>
      <canvas-panel
        preset="responsive"
        iiif-content="JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmRpZ2lyYXRpLWNvLXVrLmdpdGh1Yi5pbyUyRnd1bmRlciUyRmNhbnZhc2VzJTJGMCUyM3h5d2glM0Q0NjYlMkMyMjIxJTJDMTYxMiUyQzQ1MCUyMiUyQyUyMnR5cGUlMjIlM0ElMjJDYW52YXMlMjIlMkMlMjJwYXJ0T2YlMjIlM0ElNUIlN0IlMjJpZCUyMiUzQSUyMmh0dHBzJTNBJTJGJTJGZGlnaXJhdGktY28tdWsuZ2l0aHViLmlvJTJGd3VuZGVyLmpzb24lMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTWFuaWZlc3QlMjIlN0QlNUQlN0Q"
      />
    </div>
    
    <div style={{ marginBottom: '10px' }}>
      <canvas-panel
        preset="responsive"
        iiif-content="JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmRpZ2lyYXRpLWNvLXVrLmdpdGh1Yi5pbyUyRnd1bmRlciUyRmNhbnZhc2VzJTJGMCUyM3h5d2glM0Q4NzElMkMxMTcwJTJDNzg4JTJDMTQ4MSUyMiUyQyUyMnR5cGUlMjIlM0ElMjJDYW52YXMlMjIlMkMlMjJwYXJ0T2YlMjIlM0ElNUIlN0IlMjJpZCUyMiUzQSUyMmh0dHBzJTNBJTJGJTJGZGlnaXJhdGktY28tdWsuZ2l0aHViLmlvJTJGd3VuZGVyLmpzb24lMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTWFuaWZlc3QlMjIlN0QlNUQlN0Q"
      />
    </div>
</div>


### Programming Canvas Panel

You can also work with the Canvas from script. This is more typical in client-side applications. The attribute-based approach is more useful in rendering IIIF content server-side. You can tell Canvas Panel to do the same thing as the attributes above like this:

<Sandbox stacked project={introScript} />


## What is Vault?

By default, all `canvas-panel` elements on the page share a common instance of a [Vault](../../docs/components/vault). The Vault library is used to load and manage IIIF resources, rather than passing them directly to Canvas Panel as JSON blobs. In the example above, we load a IIIF Manifest into the same vault, which we can obtain from Canvas Panel. Then we tell Canvas Panel to display a canvas from this manifest. This is simpler and safer than loading the manifest yourself, as JSON via `fetch()`, determining its version and traversing it. 

Under the hood, Vault manages the HTTP fetch operations and optimises internal storage of all the IIIF resources in use on a page. Vault normalises all IIIF to the Presentation 3 specification, allowing you to take advantage of a consistent programming interface regardless of the source IIIF. Vault also has the advantage of making your IIIF strongly-typed when used via TypeScript.

[Read more about Vault here](../../docs/components/vault). Vault is part of [IIIF Commons](https://github.com/IIIF-Commons/vault).


## Getting started with making a Viewer

One of the most common tasks is building _viewers_ - where we load a IIIF Manifest and allow the user to navigate around the different Canvases (views) within it. You can explore Canvas Panel's features in the docs, or go straight to [Building a Simple Viewer](../docs/applications/simple-viewer) to follow along.


## Canvas Panel as part of a wider set of tools

A larger IIIF application like a viewer, manifest editor or annotation tool will certainly get a lot of benefit from using Canvas Panel.

What happens visually on Canvas Panel is a reflection of the data in Vault. Canvas Panel's own API is a mixture of styling and behaviour control, and operations that modify Vault data.

In a larger application, you are likely to be manipulating Vault data via additional mechanisms, additional UI surfaces beyond Canvas Panel, but still see the effects of that manipulation reflected in Canvas Panel. For example in a React or Vue application, UI controls are bound to data in Vault, and Canvas Panel changes in response to Vault data; you might not interact with Canvas Panel's own API much.

In a simpler application, Canvas Panel's API is more useful; it (and vault-helpers) fulfil common scenarios.

Canvas Panel aims to be a slice through a larger space of possible functionality, encapsulated in a web component. Being a web component is very powerful and simple, but it does constrain development style; there are things more easily done by bypassing the Canvas Panel API.

:::info

We'll be providing more articles about using Canvas Panel in a wider application context.

:::

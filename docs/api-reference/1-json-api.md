---
sidebar_position: 1
---

import presetSandbox from '@site/sandboxes/custom-preset.csb/_load';
import { Sandbox } from '@site/Sandbox';

# Attributes

## Properties common to Canvas Panel and Image Service

### width

The width of the component, in pixels. 
See [Styling](../examples/styling) for different ways of using Canvas Panel in layouts.

### height

The height of the component, in pixels. 
See [Styling](../examples/styling) for different ways of using Canvas Panel in layouts.

### region

Uses the IIIF syntax for a region of the canvas or image service. In zoom mode, the user can move out of this region after loading, but in other modes, it defines the rendered image.

```html
<canvas-panel region="1000,1200,900,1340">
<canvas-panel region="pct:20,20,27.95,33.33">
```

### atlas-mode

```html
<canvas-panel atlas-mode="explore"><!-- the default -->
<canvas-panel atlas-mode="sketch">
```
In the default `explore` mode, dragging and panning actions move the canvas within the viewport.

In `sketch` mode, you can do the same _but have to hold down the space bar_.

This allows drawing functions to take over.

### preferred-formats

Tell canvas panel to favour one or more formats when it constructs requests to image services - potentially overriding the service's own `preferredFormats` property.

```html
<canvas-panel preferred-formats="webp,heif">
```

See [Other Options](../future/other-options) for further details.


### preferred-qualities

Tell canvas panel to favour one or more qualities when it constructs requests to image services.

```html
<canvas-panel preferred-formats="bitonal">
```

See [Other Options](../future/other-options) for further details.

### style-id

The HTML `id` of a `<style>` element on the containing page. The CSS in that element will then be available to elements inside Canvas Panel.

```html
<style id="my-styles">
  .my-highlight { background: orange; }
</style>
<canvas-panel style-id="my-styles">
```

See [Styling](../examples/styling) for further details.

### debug

In this mode, Canvas Panel will highlight the boxes it uses to determine what's inside the viewport.

```html
<canvas-panel debug="true">
```

### preset

The `preset` attribute is a way of referencing a block of configuration data. There are three patterns for this:

```html
<!-- 1. A block of JSON defined in a <script type="application/json"> tag with the same id -->
<canvas-panel preset="#my-preset" />

<!-- 2. any external JSON data -->
<canvas-panel preset="https://example.org/other/preset.json" />

<!-- 3. A built-in preset -->
<canvas-panel preset="responsive" />
```

See [Responsive Images](../examples/rendering-modes) for further details.

### responsive

```html
<canvas-panel responsive="true">
```

(TBC - needs better description)

See [Responsive Images](../examples/rendering-modes) for further details.

### interactive

```html
<canvas-panel interactive="true">
```

(TBC - needs better description) 

See [Responsive Images](../examples/rendering-modes) for further details.

### class

(className in JavaScript)

### highlight

Accepts the same syntax as the `region` attribute, but draws a box on the canvas, rather than define the viewport.

```html
<canvas-panel highlight="1000,1200,900,1340" />
```

See [Highlights](../examples/highlighting-regions) for further details.

### highlight-css-class

A CSS class accessible to Canvas Panel, to be applied to the highlight.

```html
<canvas-panel highlight="1000,1200,900,1340" highlight-css-class="my-highlight" />
```

See [Highlights](../examples/highlighting-regions) for further details.

### exact-initial-image

Forces the component to request the image for the initial loading state in a single IIIF Image API call (if the image, or images, have IIIF Image API services).

This will happen in preference to multiple tile requests. This is useful where you know the client will make the same request each time for that image (e.g., the component has a fixed size on the page). Otherwise this is inefficient, and it's better to use tiles.

If the component is unable to paint the scene with a single request, it will revert to tile requests. This will happen if the image service does not support arbitrary region requests and does not advertise the required size in its `sizes` list.

```html
<canvas-panel exact-initial-image="true" />
```

### media

TBC

### viewport

```html
<canvas-panel viewport="true" />
```

See [Responsive Images](../examples/rendering-modes) for further details.

### render

TBC

```html
<canvas-panel render="static" />
<canvas-panel render="canvas" />
<canvas-panel render="webgl" />
```

 webgl: (don't use unless you know what you are doing)

### virtual-sizes

Adds additional `sizes` to the list of `sizes` on any image service used to render the scene, even if they are not in the image service. These virtual sizes conform to the syntax of the IIIF Image API [size](https://iiif.io/api/image/3.0/#42-size) parameter. You can supply a list of virtual sizes by separating them with the `|` character:

```html
<image-service ...
  virtual-sizes="500,|880,">
</image-service>
```

See [Responsive Images](../examples/rendering-modes) for further details.

### nested (not needed)

see https://deploy-preview-151--iiif-canvas-panel.netlify.app/docs/applications/bookreader-viewer

### x and y



## Properties only on Image Service

### src

An IIIF Image API endpoint:

```html
<image-service src="https://example.org/images/my-iiif-image-service" />
```

## Properties only on Canvas Panel

### manifest-id

As most canvases are not independently dereferenceable, this property is used to tell Canvas Panel where the canvas can be found.

### canvas-id

The `id` of the canvas to display (usually within a Manifest, but not necessarily).

### follow-annotations

### target

### text-selection-enabled

### text-enabled

### iiif-content

### choice-id

```js
element.setAttribute('choice-id', 'http://example.org/choice-1#opacity=20')
```


    

## Setting canvas panel via JSON

All canvas panel properties are exposed as their equivalent camelCase versions in JSON.

So `exact-initial-image` becomes `exactInitialImage`.

As well as supplying properties to canvas panel via attributes and via script, like this...

```html
<canvas-panel id="cp" height="200" />
<script>
    const cp = document.getElementById("cp");
    cp.width = 400;
</script>
```

...you can also supply properties by referencing JSON. Suppose you have the following block of JSON: 

```json 
// hosted at example.org/preset.json
{
  "styleId": "css",
  "manifestId": "http://example.org/manifest-1.json",
  "canvasId": "http://example.org/manifest-1/c1",
  "height": 300,
  "media": {
    "(min-width: 800px)": { 
      "height": 500,
      "manifestId": "http://example.org/manifest-2.json",
      "canvasId": "http://example.org/manifest-2/c1",
      "styleId": "css-tablet"
    },
    "(min-width: 1200px)": {
      "height": 700
    }
  }
}
```

You can supply these properties to canvas panel:

```html
<canvas-panel preset="https://example.org/preset.json" />
```

You can also do this directly on the page in a script block. This may be a more typical approach:

<Sandbox project={presetSandbox} />


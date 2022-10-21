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

:::tip
You can also make the viewers grow to fit their container [using flexbox](../examples/show-a-canvas#flexbox-and-styling). 
:::

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

:::caution
This is an upcoming feature and may not use your preferred format chosen and default to `.jpg`
:::


Tell canvas panel to favour one or more formats when it constructs requests to image services - potentially overriding the service's own `preferredFormats` property.

```html
<canvas-panel preferred-formats="webp,heif">
```

See [Other Options](../future/other-options) for further details.


### preferred-qualities

:::caution
This is an upcoming feature and may not use your preferred quality chosen and default to `default`
:::

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

If responsive is set, the shape of the viewport will match the canvas provided using the width chosen - maintaining the aspect ratio of the image. If you provide a `height` attribute, this will be ignored.

```html
<canvas-panel responsive="true">
```

See [Responsive Images](../examples/rendering-modes) for further details.

### interactive

If interative is set to false (default: true) then the user will be able to use their mouse to pan and zoom the image, and their scroll wheel to zoom. 

```html
<canvas-panel interactive="true">
```

See [Responsive Images](../examples/rendering-modes) for further details.

### class

(className in JavaScript). This can be used for CSS styling or JavaScript selectors, like a normal HTML element.

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

### viewport

Viewport mode will act like a viewer where the aspect ratio is different to the content. If you set `viewport="false"` then the aspect ratio of canvas-panel will fit the content. 

```html
<canvas-panel viewport="true" />
```

See [Responsive Images](../examples/rendering-modes) for further details.

### render

This will change which web technology will be used to render the viewer. These are usually defined in a preset and you don't have to worry about this option. You can have a deep-zoom interactive viewer renderered using the `static` preset (which is `<img />` tags), but you will see a performance hit. 

`webgl` is an option that will be much faster for deep zoom images, but requires that images have the correct CORS headers for rendering. It may also not be 100% compatible with annotation rendering options. Canvas is a good middleground for deep zoom images with annotations.

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

### nested, x and y
This will change where in the viewport the canvas is rendered. This is primarily used in `<layout-container />` for compositions of 
multiple canvases.


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

This will automatically load external annotation lists when a canvas is loaded.

### target

This is the same as `region`.

### text-selection-enabled

This will enable attached text that has been detected to be selectable. Note: this may affect panning and zooming for users. You may
need to provide a toggle in your UI to turn this on and off.

### text-enabled

This will load and discover attached text automatically. If text is found it will be available to screenreaders as an alternative to the image viewer. 

### iiif-content

This is a content state (encoded or not encoded) that can be used to provide a manifest-id, canvas-id and region together. It can also be a remote URL that resolves to a IIIF content state. This may be useful for CMS integrations where you want to have the IIIF state held somewhere else.

### choice-id

This can mark a known choice as preferred before a manifest is loaded and without using JS events. You can also optionally use a hash parameter to specifity the opacity. For this reason choices with hash parameters are not supported in canvas panel.

```js
element.setAttribute('choice-id', 'http://example.org/choice-1#opacity=20')
```


## Zoom status API

Atlas has some internal events that it fires when changes occur in the viewer. The first thing that was done was a bridge to these. As such there are 2 new events (normal addEventListener + detail handling):
* `go-home`
* `zoom-to`  (in, out, scroll)

Additionally there is a 3rd event: `zoom` . The problem is that when the zoom-to event is fired, the viewport has only just started it's transition. It's very much a notification that "recently a zoom was initiated" more than a precise tracker. For this reason the zoom event.

This will fire once the current transitioning zoom has completed. It contains information on the max/min zoom and booleans for if we have reached the max/min (isMax, isMin). The zoom event also fires when you call zoom-to . It does not fire when a user creates a custom transition.

```
el.addEventListener('zoom', ev => {
  ev.detail.scaleFactor; // 0.123456
  ev.details.max; // 1
  ev.details.min; // 0.123456
  ev.details.isMin; // true
  ev.details.isMax; // false
  ev.details.factor; // if user initiated a zoom - the factor scaled
})
```

There is also `getZoom()` , `getMaxZoom()`  and `getMinZoom()`  on the web component too, in addition to `getZoomInformation()`  which returns them all (max/min/current).

## Movement API

The goal is to know where the viewport is. So in Atlas there are smooth transitions, and as such when something is transitioning there will be a lot of changes in where the viewport is. There are 2 separate attributes covering this:
* `move-events="true"` - this attribute will enable the move event, since it is noisy
* `granular-move-events="true"` - this will enable granular (requires above too)

Since there are so many events, the firing of them is completely opt-in*. The new event is:
```
el.addEventListener('move', e => {
  e.detail.x;
  e.detail.y;
  e.detail.width;
  e.detail.height;
  e.detail.lastX;
  e.detail.lastY;
  e.detail.points;
});
```

*The granular option will affect performance - you would be better setting up a loop ever N seconds and updating in that way.
    

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

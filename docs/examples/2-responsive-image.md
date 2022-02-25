---
sidebar_position: 2
---

# Responsive Images and rendering modes

import { GitHubDiscussion } from "../../GitHubDiscussion.js";
import respPreset1 from '@site/sandboxes/02-responsive/custom-preset-1.csb/_load';
import respPreset2 from '@site/sandboxes/02-responsive/custom-preset-2.csb/_load';
import { Sandbox } from '@site/Sandbox';


Using IIIF for [responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) is a natural fit. An image service allows different sizes, and/or different regions to be requested. You can construct standard HTML5 `srcset` and `picture` elements manually using IIIF Image API requests as the image sources.

The `image-service` and `canvas-panel` elements offer API to achieve a similar outcome using familiar patterns, but instead of providing information for matching media queries via HTML elements and attributes, you can pass this information into canvas panel using JSON configuration. This is a very powerful way of controlling Canvas Panel's behaviour.

Simply declaring an `image-service` or `canvas-panel` tag as `responsive` makes it behave like a responsive image; it will make image requests appropriate to its size on the page.

```html
<image-service 
  preset="responsive"
  src="https://iiif.wellcomecollection.org/image/L0007430">
</image-service>
```

<image-service 
  preset="responsive"
  src="https://iiif.wellcomecollection.org/image/L0007430">
</image-service>

The image-service tag optimises the requests it makes, taking note of any specific [sizes](https://iiif.io/api/image/3.0/#53-sizes) advertised by the IIIF image service; if they are suitable to use, it will prefer one of these to tiles.

Sometimes you want to force a single image request, rather than generate multiple tile requests. You can add additional `sizes` to the list of candidates even if they are not in the image service, with the `virtual-sizes` attribute:


```html
<image-service 
    preset="responsive"
    src="https://iiif.wellcomecollection.org/image/L0007430" 
    width="500"
    height="800"
    virtual-sizes="500,">
</image-service>
```

<image-service 
  preset="responsive"
  src="https://iiif.wellcomecollection.org/image/L0007430" 
  width="500"
  height="800"
  virtual-sizes="500,">
</image-service>

And you can also force the component to make a single image request, on initial load at least, no matter what the size, using `exact-initial-image="true"`.


More complex responsive image scenarios involve media queries, like this:

`media="(min-width: 600px)"`

Rather than nested within HTML elements, `image-service` and `canvas-panel` can take complex configuration from JSON. This includes all the attributes already seen in this documentation, but also includes constructions that are much more easily conveyed via JSON:

```html
<script id="my-preset" type="application/json">
{
  "styleId": "css",
  "height": 300,
  "canvasId": "https://iiif.wellcomecollection.org/presentation/b28929780/canvases/b28929780_0006.jp2",
  "media": {
    "(min-width: 800px)": {
      "canvasId": "https://iiif.wellcomecollection.org/presentation/b28929780/canvases/b28929780_0004.jp2", 
      "height": 500
    },
    "(min-width: 1200px)": {
      "height": 700
    }
  }
}
</script>
<canvas-panel preset="#my-preset"></canvas-panel>
```

<Sandbox project={respPreset1} />

(This is better viewed by launching the separate code sandbox, click the icon in the bottom-right corner then resize the output frame).

This example is deliberately unusual; the canvas itself changes at a particular breakpoint!

More typical might be showing a different region of the Canvas, or different aspect ratio images, at different points:

<Sandbox project={respPreset2} />

TODO - demonstrate that responsive breakpoints can be used on image-service, too

If there is a IIIF Image Service available, canvas-panel or image-service will use it to make optimised requests. But the same syntax, using the canvas region property, will work even if the canvas just has a static image on it (i.e., with no image service).


## Presets

As seen in the above examples, the `preset` attribute is a way of referencing a block of configuration data. There are three patterns for this:


```html
<!-- 1. A block of JSON defined in a <script type="application/json"> tag with the same id -->
<canvas-panel preset="#my-preset" />

<!-- 2. any external JSON data -->
<canvas-panel preset="https://example.org/other/preset.json" />

<!-- 3. A built-in preset -->
<canvas-panel preset="responsive" />
```

The on-page or external JSON in 1 and 2 could come from a dynamic service that tailors attributes for a particular canvas.

## Built-in presets

The three built-in presets provide values for three attributes:

```html
<canvas-panel preset="zoom" />
```

This (the default preset) is the same as:

```html
<canvas-panel 
   render="canvas"
   interactive="true"
   viewport="true"
/>
```

These above three attributes are set to these values by default unless a different preset is provided or they are individually set.

```html
<canvas-panel preset="static" />
```

This is the same as:

```html
<canvas-panel 
   render="static"
   interactive="false"
   viewport="true"
/>
```

```html
<canvas-panel preset="responsive" />
```

This is the same as:

```html
<canvas-panel 
   render="static"
   interactive="false"
   viewport="false"
/>
```

The default `zoom` preset and the `static` preset generate similar layouts. They both offer a viewport, and will preserve the shape of the canvas, fitting it inside the viewport (unless a `region` is specified). In the static preset, there is no panning or zooming.

The `responsive` preset behaves more like an image - 

See [Styling](styling) for more guidance on using canvas panel in different layout systems.


<GitHubDiscussion ghid="2" />
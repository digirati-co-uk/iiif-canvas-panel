---
sidebar_position: 2
---

# Responsive Images and rendering modes

import { GitHubDiscussion } from "../../GitHubDiscussion.js";


TODO

-------------------

```
switch (preset) {
    case 'static': {
      return {
        render: 'static',
        interactive: false,
        viewport: true,
      };
    }
    case 'responsive': {
      return {
        render: 'static',
        interactive: false,
        viewport: false,
      };
    }
    case 'zoom': {
      return {
        render: 'canvas',
        interactive: true,
        viewport: true,
      };
    }
  }

```

> I think I've implemented the preset and its dependencies - I played around with responsive images a bit. I've added 3 presets, like the original docs. static which is still a viewport but not interactive and static images. responsive which is not a viewport, not interactive and static images and zoom or default - which is normal.


For the <script id="my-preset">{"height": 600}</script>  I've changed the syntax slightly:
<canvas-panel preset="#my-preset" />
<canvas-panel preset="https://example.org/other/preset.json" />
<canvas-panel preset="responsive" />

Related updates:
Compatible with media queries - once bug is fixed (HOW)
Resizes very similar to an image. If you set a viewport of 512x100% it will "fit" inside responsively
There is an extra <div /> to facilitate the sizings. There is an Atlas hook for styling, but not a canvas panel one. Possibly a CSS API. This allows for centring the fix-aspect ratio image.
Viewport works with region/target too, so if you "crop" an image, the aspect ratio will match and the home position will be the crop. If it's not interactive, this will act almost like a cropped <img/>  tag

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

`cp.media.add('min-width: 800px', { ... config ... });`

(can we do that)? don't think so.

------------------------


<image-service 
  preset="responsive"
 src="https://iiif.wellcomecollection.org/image/L0007430" 
 width="880"
 virtual-sizes="880,"></image-service>




<!-- TODO: GH-79 -->
Using IIIF for responsive images is a natural fit. Canvas Panel makes this easy, and can populate the HTML5 `srcset` attributes that you need to do when using the HTML5 [picture element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture). The tag knows about available sizes because it has the image service (or the canvas). There is typically a media query involved, too:

`media="(min-width: 600px)"`

The developer can step in and control this process. Here we start by using the `<image-service>` tag for contrast - but `<canvas-panel>` takes the same content.

<!-- TODO: GH-79 -->
```html 
<!-- use the service sizes property, if present, and/or default "break points" 
     to generate a sensible picture element without any further thinking for the developer: -->
<image-service src="http://..." render="responsive" />
```

Most of the time, it should be OK just to use the above form and let the tag do the hard work.
Sometimes you want to provide specific sizes for particular media queries. This is where `image-service` and `canvas-panel` syntax meets HTML5 responsive image syntax: The `size` attribute here is the `/size/` slot in the IIIF Image API parameters.


TODO - `size` attribute - don't use this let CP pick the size
But we can supply `virtualSizes` as a hint for CP, although CP will infer this itself from `sizes` on the image service.
We can use `virtualSizes` to force a size that might not be listed in the `sizes` on the image service.

<!-- TODO: GH-79 -->
```html
<image-service src="https://..." render="responsive">
  <source media="(min-width: 800px)" size="800,">
  <source media="(min-width: 1600px)" size="1600,">
</image-service>
```

The media queries just pass through to the rendered HTML 5 `picture` element.

You can also specify _regions_, again using IIIF Image API syntax. This attribute defaults to "full":

```html
<image-service src="http://..." render="responsive">
  <source media="(min-width: 800px)" region="120,850,2100,2000" size="800,">
  <source media="(min-width: 1600px)" region="full" size="1600,">
</image-service>
```

 - hint with virtualSizes

 You can set the width of the element to make it behave _almost_ like an image.
 CSS img properties like `cover` and `contain` don't apply to it.


We use the same syntax for canvas panel, _even when we're not necessarily dealing with an image service_ - as long as the canvas has width and height (i.e., this doesn't make sense for an audio-only canvas):

<!-- TODO: GH-79 -->
```html
<canvas-panel iiif-content="..">
  <source media="(min-width: 800px)" region="120,850,2100,2000", size="800,">
  <source media="(min-width: 1600px)" region="full" size="1600,">
</canvas-panel>
```


## Presets

TODO explain the three presets and why you use them

Other things you can change with presets...
e.g. change canvas based on viewport

static and zoom are similar, in that they don't change the shape
responsive still has aspect ratio

Do we need an aspect ratio attribute?


<GitHubDiscussion ghid="2" />
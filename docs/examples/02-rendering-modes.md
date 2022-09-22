---
sidebar_position: 2
---

# Rendering modes

import { GitHubDiscussion } from "../../GitHubDiscussion.js";
import respPreset1 from '@site/sandboxes/02-responsive/custom-preset-1.csb/_load';
import respPreset2 from '@site/sandboxes/02-responsive/custom-preset-2.csb/_load';
import { Sandbox } from '@site/Sandbox';

## Responsive Images

Using IIIF for [responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) is a natural fit. An image service allows different sizes, and/or different regions to be requested. You can construct standard HTML5 `srcset` and `picture` elements manually using IIIF Image API requests as the image sources.

The [`<image-service />`](../../docs/components/single-image-service) and [`<canvas-panel />`](../../docs/components/cp) elements offer API to achieve a similar outcome using familiar patterns, but instead of providing information for matching media queries via HTML elements and attributes, you can pass this information into canvas panel using JSON configuration. This is a very powerful way of controlling Canvas Panel's behaviour.

Simply declaring an `image-service` or `canvas-panel` tag as `responsive` makes it behave like a responsive image; it will make image requests **appropriate to its size on the page**.

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

The image-service tag optimises the requests it makes, taking note of any specific [sizes](https://iiif.io/api/image/3.0/#53-sizes) advertised by the IIIF image service; if they are suitable to use, it will prefer one of these to [tiles](https://iiif.io/api/image/3.0/#54-tiles).

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

These virtual sizes conform to the syntax of the IIIF Image API [size](https://iiif.io/api/image/3.0/#42-size) parameter. You can supply a list of virtual sizes by separating them with the `|` character:

```html
<image-service ...
  virtual-sizes="500,|880,">
</image-service>
```
And you can also force the component to make a single image request, on initial load at least, no matter what the size, using `exact-initial-image="true"`.

```html
<image-service ...
  virtual-sizes="500,|880,"
  exact-initial-image="true">
</image-service>
```

:::tip

## Responsive Images and Caches

Careful use of `virtual-sizes` and `exact-initial-image`, as well as publishing preferred or optimal `sizes` on your IIIF Image Services, can dramatically improve the user experience by speeding up image loading, when the Canvas Panel (or Image Service component) is the client. If you have a Content Delivery Network, or other form of web cache in front of your image servers, then

If you are in reponsive or static mode, and your page layout and attributes ensure that the required image will always be the same size (or one of a small number of known sizes depending on media queries), then your cache will be populated with these images.

You can even combine zoom behaviour with an initial full static image, by starting canvas panel in responsive mode and then switching to zoom after a user interaction.

Canvas Panel also attempts to load the smallest image it can as a placeholder while loading in larger images.

You need to be careful, though - if you have a flexible layout, so that different users won't normally request exactly the same image, then it's better to leave Canvas Panel to decide what tiles and/or fized sizes to request, and have your cache fill up with fixed size tiles.

:::


## Media queries and more

More complex responsive image scenarios involve media queries, like this:

`media="(min-width: 600px)"`

Rather than nested within HTML elements, `image-service` and `canvas-panel` can take complex configuration from JSON. This includes all the attributes already seen in this documentation, but also includes constructions that are much more easily conveyed via JSON.

You can mix values supplied as tag attributes and attributes supplied as JSON. For a (contrived) example, you might want to set the manifest ID on the web component, but vary the canvas in two different JSON presets:

<Sandbox project={respPreset1} />

(This is better viewed by launching the separate code sandbox, click the icon in the bottom-right corner then resize the output frame).

This example is deliberately unusual; the canvas itself changes at a particular breakpoint!

More typical might be showing a different region of the Canvas, or different aspect ratio images, at different points:

<Sandbox project={respPreset2} />

The `image-service` component can also take the same media-query syntax. 

If there is a IIIF Image Service available, canvas-panel or image-service will use it to make optimised requests. But the same syntax, using the canvas region property, will work even if the canvas just has a static image on it (i.e., with no image service).

This media query syntax can supply different properties to canvas panel for _any_ [supported query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries), not just browser widths. For example, you could switch on `prefers-contrast` or `prefers-reduced-motion` to change the behaviour and event the content of Canvas Panel.

An example of this can be seen on the [accessibility](./accessibility) page, where a high-contrast mode is enabled.

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

The `responsive` preset behaves more like an image - it doesn't occupy any space on the page outside of the available media (unless the IIIF Canvas has blank space on it).

It's possible to combine `render`, `interactive` and `viewport` in ways other than the three presets, but these are likely the most common combinations.

See [Styling](styling) for more guidance on using canvas panel in different layout systems.

For more details on the available attributes, see [API](./json-api).


## Rendering strategies

Canvas panel has 5 internal variables, with the following defaults:

```json
{
  "renderSmallestFallback": true,
  "renderLayers": 2,
  "minSize": 256,
  "maxImageSize": 1024,
  "quality": 1,
}
```

> In the current Canvas Panel, these are not configurable via the API.

For a Canvas that has a single image service, Canvas Panel will construct a list of candidate image requests, ordered by size. Some will be labelled with "priority" for exact sizes - as advertised in the image service's `sizes` property, if it has one, and any `virtual-sizes` set on Canvas Panel itself. These images are _assumed_ to be more likely to be in web caches. Included in the list is tiled images, and their real-pixel widths.

Canvas Panel then filters out any that are outside of the min/max size in the config. It also removes images that are close in size to priority images (it will prefer the priority images).

The `quality` setting determines how much Canvas Panel super-samples. For example, a value of 2 would request images twice as large as the viewport. Canvas Panel then picks the closest image and uses the `renderLayers` setting to decide how many of the sizes to paint (useful for loading fallbacks) - which are just the next smallest from the chosen image. This allows a lower resolution image to load quickly while the larger image is still downloading.

If `renderSmallestFallback` is set to `true`, we also add the smallest image (usually ~256px) to act as a final fallback.

For responsive images, there are three steps:

* The gathering of all valid sizes
* Filtering which sizes make a good pyramid
* Choosing the best size from the list


<GitHubDiscussion ghid="2" />
---
sidebar_position: 5
title: <layout-container />
---

# Layout container

import layoutContainer from '@site/sandboxes/layout-container.csb/_load';
import { Sandbox } from '@site/Sandbox';

A common requirement when building a more complex viewer application is to show multiple canvases, or images, at the same time, for example:

 - rendering thumbnails
 - rendering a 2-up view
 
In many scenarios this is not a canvas panel concern - as a web component, you can simply position multiple instances of `<canvas-panel />` or `<image-service />` using CSS. They are HTML elements on the page. Most thumbnail rendering UIs are better off using the thumbnail service of a Canvas either directly as the `src` attribute of an `<img />` tag (picking an appropriate size) or more conveniently as the `src` attribute of an `<image-service />` component. These could be laid out with Flexbox or other CSS mechanisms. You could also arrange `<canvas-panel />` components this way, using the `static` preset.
 
## Sharing a viewport

Where this is insufficient is when multiple _sources_ - image services and/or canvases - need to share the same viewport. The "zoom space" needs to be larger and control of zooming and panning in that zoom space needs to be _hoisted_ to a viewport shared by other content.

The `<layout-container />` component provides this higher-level zoom space or _World_. It uses the same viewport implementation as `<canvas-panel />` and `<image-service />`. It takes the same `preset` attribute to determine behaviour within the viewport.

```html
<layout-container width="800" preset="zoom">
    <image-service nested="true" src="https://iiif.wellcomecollection.org/image/b18035723_0010.JP2" x="0"></image-service> 
    <image-service nested="true" src="https://iiif.wellcomecollection.org/image/b18035723_0011.JP2" x="2411" /></image-service>
</layout-container>
```
The canvas-panel and/or image-service components can then be positioned within the World-space using the `x` and `y` properties.

<Sandbox stacked project={layoutContainer} />

# Reacting to events

If the zoom surface provides access to another view (e.g., you are using the layout container for deep-zoom thumbnails), you can capture events on the individual components.

TODO - demo showing clicks on thumbnails

# Relative position

To meet the use case of a two-up viewer, `<layout-container>` allows you to position image services and canvases relative to each other. The developer needs to provide these offsets, driven by information that these components on their own do not have. For example, if you are rendering a 2-up view showing a page opening, the information about which two pages should be shown (verso, recto) is determined by Presentation API properties of the Manifest, like `viewingDirection` and the `paged` behavior property. The x-offset could be determined from the width of the first canvas, plus whatever gutter (space between) the images is appropriate. The y-offset might be required if the images need to be aligned based on their contents, if they have been photographed without alignment. But that use case requires additional information not present in the IIIF resources.

# Relative size

:::danger

This feature is still in development and not available in release versions

:::

The layout is based on the size (width and height) of the image services or canvases contained. Usually, two images to be shown together like this share a common scale. This is not always the case - for example, presenting two images photographed at very different resolutions, or needing to offset the scale changes introduced on a rostrum when photographing a thick book without moving the camera.

Support for scaling within the layout will be added in a future version.


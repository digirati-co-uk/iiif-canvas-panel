---
sidebar_position: 2
title: <image-service />
---

# Image service

import { GitHubDiscussion } from "../../GitHubDiscussion.js";


Sometimes you really do have an image service, rather than anything from the Presentation API.

There's no notion of scene composition here - it's just one image service. And it can't carry annotations - that's what a canvas is for.

But we do provide a component to render it, that has the same `static`, `responsive` and `zoom` (the default) modes as canvas-panel.

```html
<!-- This behaves like an image tag -->
<image-service src="https://iiif.wellcomecollection.org/image/b18035723_0001.JP2" />
```

<image-service src="https://iiif.wellcomecollection.org/image/b18035723_0001.JP2" />

By default, the image service will expand to fill the container it is in, with a height of 512px.

However, you can't draw on this, or do anything else with annotations. If you only have an image service but need to do more with it, then you can create a canvas programmatically, place the image service on it, and use Canvas Panel to render it.

You can also set set the height and width directly:

```html
<image-service width="512" height="256" 
   src="https://iiif.wellcomecollection.org/image/b18035723_0001.JP2" />
```

<image-service width="512" height="256" src="https://iiif.wellcomecollection.org/image/b18035723_0001.JP2" />


By default this image is zoomable, but you can change that behaviour with a `preset`:

```html
<image-service width="512" height="256" preset="static"
   src="https://iiif.wellcomecollection.org/image/b18035723_0001.JP2" />
```

<image-service width="512" height="256" preset="static" src="https://iiif.wellcomecollection.org/image/b18035723_0001.JP2" />


You can also ask for a specific region of the image:

```html
<image-service
   preset="responsive"
   width="400"
   height="400"
   region="1000,1000,1000,1000"
   src="https://iiif.wellcomecollection.org/image/b18035723_0001.JP2"
/>
```

<image-service
   preset="responsive"
   width="400"
   height="400"
   region="1000,1000,1000,1000"
   src="https://iiif.wellcomecollection.org/image/b18035723_0001.JP2"
/>
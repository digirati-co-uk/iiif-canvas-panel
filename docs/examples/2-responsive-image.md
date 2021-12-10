---
sidebar_position: 2
---

# Responsive Images

import { GitHubDiscussion } from "../../GitHubDiscussion.js";


Using IIIF for responsive images is a natural fit. Canvas Panel makes this easy, and can populate the HTML5 `srcset` attributes that you need to do when using the HTML5 [picture element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture). The tag knows about available sizes because it has the image service (or the canvas). There is typically a media query involved, too:

`media="(min-width: 600px)"`

The developer can step in aqnd control this process. Here we start by using the `<img-service>` tag for contrast - but `<canvas-panel>` takes the same content.

```html
// use the service sizes property, if present, and/or default "break points" to generate a sensible picture element without any further thinking for the developer:
<img-service src="http://..." render="responsive" />

// most of the time, it should be OK just to use the above form and let the tag do the hard work.

// provide media queries and corresponding size values; the syntax is the size slot in the Image API.
<img-service src="https://..." render="responsive">
  <source media="(min-width: 800px)" size="800,">
  <source media="(min-width: 1600px)" size="1600,">
</img-service>

// the media queries just pass through to the rendered <picture> element, we're not trying to be clever and interpret them ourselves.

// you can also specify regions (region defaults to full):

<img-service src="http://..." render="responsive">
  <source media="(min-width: 800px)" region="120,850,2100,2000", size="800,">
  <source media="(min-width: 1600px)" region="full" size="1600,">
</img-service>

// note that while the rendered picture element would include an <img /> tag, we obviously don't need one in this component, it has all the info it needs.

// What about when this is a canvas?
// can we use the same syntax completely even though we're not necessarily dealing with an image service? Region and size work for 2D canvases too..

<canvas-panel iiif-content="..">
  <source media="(min-width: 800px)" region="120,850,2100,2000", size="800,">
  <source media="(min-width: 1600px)" region="full" size="1600,">
</canvas-panel>
```

<GitHubDiscussion ghid="2" />
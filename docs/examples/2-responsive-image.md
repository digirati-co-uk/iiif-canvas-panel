---
sidebar_position: 2
---

# Responsive Images

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

<!-- TODO: GH-79 -->
Using IIIF for responsive images is a natural fit. Canvas Panel makes this easy, and can populate the HTML5 `srcset` attributes that you need to do when using the HTML5 [picture element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture). The tag knows about available sizes because it has the image service (or the canvas). There is typically a media query involved, too:

`media="(min-width: 600px)"`

The developer can step in and control this process. Here we start by using the `<img-service>` tag for contrast - but `<canvas-panel>` takes the same content.

<!-- TODO: GH-79 -->
```html 
<!-- use the service sizes property, if present, and/or default "break points" 
     to generate a sensible picture element without any further thinking for the developer: -->
<img-service src="http://..." render="responsive" />
```

Most of the time, it should be OK just to use the above form and let the tag do the hard work.
Sometimes you want to provide specific sizes for particular media queries. This is where `img-service` and `canvas-panel` syntax meets HTML5 responsive image syntax: The `size` attribute here is the `/size/` slot in the IIIF Image API parameters.

<!-- TODO: GH-79 -->
```html
<img-service src="https://..." render="responsive">
  <source media="(min-width: 800px)" size="800,">
  <source media="(min-width: 1600px)" size="1600,">
</img-service>
```

The media queries just pass through to the rendered HTML 5 <picture> element.

You can also specify _regions_, again using IIIF Image API syntax. This attribute defaults to "full":

```html
<img-service src="http://..." render="responsive">
  <source media="(min-width: 800px)" region="120,850,2100,2000", size="800,">
  <source media="(min-width: 1600px)" region="full" size="1600,">
</img-service>
```

We use the same syntax for canvas panel, _even when we're not necessarily dealing with an image service_ - as long as the canvas has width and height (i.e., this doesn't make sense for an audio-only canvas):

<!-- TODO: GH-79 -->
```html
<canvas-panel iiif-content="..">
  <source media="(min-width: 800px)" region="120,850,2100,2000", size="800,">
  <source media="(min-width: 1600px)" region="full" size="1600,">
</canvas-panel>
```

<GitHubDiscussion ghid="2" />
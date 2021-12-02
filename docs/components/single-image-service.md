---
sidebar_position: 1
---

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

# Single Image Service

Sometimes you really do have an image service, rather than anything from the Presentation API.

There's no notion of scene composition here - it's just one image service. And it can't carry annotations - that's what a canvas is for.

But we do provide a component to render it, that has the same `static`, `responsive` and `zoom` (the default) modes as canvas-panel.

```html
<!-- This behaves like an image tag -->
<img-service src="https://iiif.wellcomecollection.org/thumbs/B28560450.JP2" render="static" />
```

However, you can't draw on this, or do anything else with annotations. If you only have an image service but need to do more with it, then you can create a canvas programmatically, place the image service on it, and use Canvas Panel to render it.


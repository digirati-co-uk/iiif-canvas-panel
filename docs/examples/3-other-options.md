---
sidebar_position: 3
---

# Other image options

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

## Preferred Formats

:::danger

This feature is still in development and not yet in the release version.

:::

The `preferredFormats` property is a feature of the [IIIF Image API version 3](https://iiif.io/api/image/3.0/#55-preferred-formats).

It allows the publisher to suggest that the client ask for a different format from the default JPEG. For example, if publishing line art, `.png` might be better.

Canvas Panel (and `<img-service/>`) will use the preferred format(s) automatically if consuming a IIIF Image API 3 endpoint (and if they are available), but it also supports the concept as a client property; using Canvas Panel on a web page you can state a preference _as a consumer_, regardless of whether the server has this property. This works for Image API version 2 services as well:

<!-- TODO: GH-68 -->
```html
<canvas-panel iiif-content=".." preferred-formats="png"></canvas-panel>
<canvas-panel iiif-content=".." preferred-formats="webp,jpg"></canvas-panel><!-- equivalent to just "webp" -->
```

> Show it!

If the format is not available, the tag will fall back to the default jpg.


TODO - also you can change the `quality` param

```html
<canvas-panel iiif-content=".." preferred-formats="png" preferred-quality="psychedelic,bitonal,gray"></canvas-panel>
```

<GitHubDiscussion ghid="45" />
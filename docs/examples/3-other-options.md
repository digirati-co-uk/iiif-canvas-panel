---
sidebar_position: 3
---

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

# Other image options

If there are version 3 image services, and if they supply a `preferredFormats` property, Canvas Panel (and `<img-service/>`) will use the preferred format(s).

The user can also set a preferred format manually, which works for version 2 image services, too:

```html
<canvas-panel iiif-content=".." preferred-formats="png"></canvas-panel>
<canvas-panel iiif-content=".." preferred-formats="webp,jpg"></canvas-panel>
```

> Show it!

If this format is not available the tag will fall back to the default jpg.

<GitHubDiscussion ghid="3" />
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

> (Demo forthcoming when feature is implemented)

If the format is not available, the tag will fall back to the default jpg.

## Preferred Qualities

:::danger

This feature is still in development and not yet in the release version.

:::

This is very similar to the behaviour of `preferred-formats`. It allows you to provide a hint to Canvas Panel that you would like a [quality](https://iiif.io/api/image/3.0/#quality) (in IIIF Image API terms) that is different from `default`. If the quality is unavailable, canvas panel will fall back through the list, or request default if there is no other possibility.

Unlike preferred formats, there is no equivalent preferred _qualities_ in the Image API - the provider of the service can choose what `default` means, but they can't choose what `png` means - the two features are not exactly equivalent.

If you know that your application is making calls to a server that provides special or custom `quality` support, this is how you can pass the required values:

```html
<canvas-panel iiif-content=".." preferred-quality="bitonal"></canvas-panel>
<!-- or same for image-service -->
<image-service src=".." preferred-formats="webp" preferred-quality="posterised,craquelure"></image-service>
```


<GitHubDiscussion ghid="45" />
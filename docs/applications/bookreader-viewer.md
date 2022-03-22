---
sidebar_position: 2
title: Book Reader
---

# A Bookreader viewer, with facing pages

import { GitHubIssue } from "../../GitHubDiscussion.js";


This example builds on the minimal viewer by adding support for 2-up views - facing pages - and showing simple annotations.

_This viewer is then extended by [Content State Selector](./content-state-selector) and [Text-centric Viewer](./text-centric)._

An example of wrapping a Canvas Panel (or in this case, image-service) component inside a higher-level component:

```html
<atlas-viewer width="800" preset="zoom">
    <image-service nested src="https://iiif.wellcomecollection.org/image/b18035723_0010.JP2" x="0" /> 
    <image-service nested src="https://iiif.wellcomecollection.org/image/b18035723_0011.JP2" x="2411" />
</atlas-viewer>
```

<atlas-viewer width="800" preset="zoom">
    <image-service nested src="https://iiif.wellcomecollection.org/image/b18035723_0010.JP2" x="0" /> 
    <image-service nested src="https://iiif.wellcomecollection.org/image/b18035723_0011.JP2" x="2411" />
</atlas-viewer>

> Atlas Viewer is a developer tool (whereas Canvas Panel is equivalent to OpenSeadragon). [Atlas Viewer on GitHub](https://github.com/atlas-viewer/atlas)

The same thing can be done with canvas-panel instances:

```html
<atlas-viewer width="800" preset="zoom">
    <canvas-panel nested manifest-id="https://digirati-co-uk.github.io/wunder.json" canvas-id="https://digirati-co-uk.github.io/wunder/canvases/8" x="0" /> 
    <canvas-panel nested manifest-id="https://digirati-co-uk.github.io/wunder.json" canvas-id="https://digirati-co-uk.github.io/wunder/canvases/9" x="2411" />
</atlas-viewer>
```

<atlas-viewer width="800" preset="zoom">
    <canvas-panel nested manifest-id="https://digirati-co-uk.github.io/wunder.json" canvas-id="https://digirati-co-uk.github.io/wunder/canvases/8" x="0" /> 
    <canvas-panel nested manifest-id="https://digirati-co-uk.github.io/wunder.json" canvas-id="https://digirati-co-uk.github.io/wunder/canvases/9" x="2411" />
</atlas-viewer>


<GitHubIssue ghid="64" />

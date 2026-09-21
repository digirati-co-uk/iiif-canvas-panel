---
sidebar_position: 3
title: <canvas-panel />
---

# Canvas panel

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

When building a IIIF Presentation API viewer, it will be much easier to use Canvas Panel than
[the img-service tag](./single-image-service). This is because you are dealing with canvases in manifests - you pass the
canvas to Canvas Panel to render, rather than wrrying about its content. It might not even have an image service.

See the [quick start](../intro) to get started.

## View rotation

`<canvas-panel>` and `<image-service>` support camera rotation independently of `rotation`, which continues to rotate
the scene object:

```html
<canvas-panel
  canvas-id="https://example.org/canvas/1"
  view-rotation="45"
  enable-touch-rotation="true"
  touch-rotation-snap="90"
></canvas-panel>
```

`view-rotation` sets an absolute clockwise angle in degrees when changed. Two-finger rotation is enabled by default.
`touch-rotation-snap` defaults to `90`; use `0` for free rotation or an interval from `0` to `360` degrees. Changing the
snap interval rebuilds the viewer, like other controller configuration changes. Toggling touch rotation preserves the
current view and leaves pan/zoom enabled.

Call the following methods once the Atlas runtime is available (for example, inside `panel.withAtlas(() => { ... })`):

```js
panel.setViewRotation(45); // immediate absolute angle
panel.getViewRotation(); // live angle, including touch gestures
panel.rotateBy(); // animate a clockwise quarter turn
panel.rotateBy(-90); // animate anticlockwise
panel.rotateBy(15, { x: 500, y: 300 }, true); // world-space pivot, immediate
panel.setTouchRotationEnabled(false);
panel.getTouchRotationEnabled();
```

The React adapter exposes `viewRotation`, `enableTouchRotation`, and `touchRotationSnap` props, plus the same methods
through its element ref. `setRotation()` / `getRotation()` retain their existing object-rotation behavior.

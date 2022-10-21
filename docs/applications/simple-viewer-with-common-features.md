---
sidebar_position: 4
---

# Simple viewer - common features

import overlays from '@site/sandboxes/overlay-controls.csb/_load';
import { Sandbox } from '@site/Sandbox';

Canvas Panel is a component of a IIIF viewer, rather than a viewer in its own right.

However, there are several expected viewer features, that Canvas Panel helps implement. 

<Sandbox stacked project={overlays} />

## Placing buttons on top of the Canvas

This is through CSS positioning, as in the example above.

## Full screen

This makes Canvas Panel invoke the browser's full screen "F11" API and take up the entire _screen_ (not browser). How you do this may be up to your application, but the example above uses the following:

```html
<button onClick="(cp.requestFullscreen || cp.webkitRequestFullscreen).call(cp)" />
```

This is not a Canvas Panel feature but a browser feature. It may not work in the sandbox environment.

## Zoom in/out buttons

Simply wire up your buttons to Canvas Panel's zoomIn and zoomOut methods:

```html
<button class="osd" onClick="cp.zoomIn()">🔍+</button>
<button class="osd" onClick="cp.zoomOut()">🔍–</button>
```

## Reset

The `goHome()` function will return the viewport to the initial condition:

```js
cp.goHome();
```



---
sidebar_position: 16
---

# Reacting to the user

<!-- TODO: GH-110 -->

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

Canvas Panel can listen for most kinds of browser DOM events on the canvas
surface, and raise events for your application code. As well as clicks and
movement, events raised by the presence of IIIF features are also available,
such as `choice`.

Raised events supply arguments that typically give you the position at which the
event occurred, and references to the Vault data relevant to the event (e.g., a
click on an annotation).

## World Ready

When Canvas Panel loads a manifest, there will be a point at which Canvas Panel
has been initialized, but the underlying Atlas viewer hasn't loaded the manifest
and the canvas itself. the `world-ready` event fires when the Atlas Viewer has
loaded enough of the manifest to understand the size of the world and the zoom
state. The shape of the event looks like:

```js

{
    canZoomIn: true, // whether the user can zoom in or not using the zoomIn() method,
    canZoomOut: false, // whether the user can zoom out or not using the zoomOut() method,
    scaleFactor: 0.11234, // the current scale factor for the zoom
    current: 0.1134, // the last known scale
    max: 1.0 , // the maximum scale factor
    min: 0.01111, // the minium scale factor
    worldHeight: 1246, // the height of the world that was constructed
    worldWidth: 3000, // the width of the world constructed
}

```

## Reacting to Zoom

Atlas has some internal events that it fires when changes occur in the viewer.
The first thing that was done was a bridge to these. As such there are 2 new
events (normal addEventListener + detail handling):

- `go-home`
- `zoom-to` (in, out, scroll)

Additionally there is a 3rd event: `zoom` . The problem is that when the zoom-to
event is fired, the viewport has only just started it's transition. It's very
much a notification that "recently a zoom was initiated" more than a precise
tracker.

Below is an example of a Zoom Event:

```javascript
el.addEventListener("zoom", (ev) => {
  ev.detail.scaleFactor; // 0.123456
  ev.details.max; // 1
  ev.details.min; // 0.123456
  ev.details.isMin; // true
  ev.details.isMax; // false
  ev.details.factor; // if user initiated a zoom - the factor scaled
  ev.detail.canZoomIn; // whether the user can zoom in or not using the zoomIn() method,
  ev.detail.canZoomOut; // whether the user can zoom out or not using the zoomOut() method,
});
```

This will fire once the current transitioning zoom has completed. It contains
information on the max/min zoom and booleans for if we have reached the max/min
(isMax, isMin). The zoom event also fires when you call `zoom-to`,
`goto-region`, `go-home`, or when `recalculate-world-size` is called by the
system. It does not fire when a user creates a custom transition.

Below is an example of a custom transition:

```javascript
// an example of a custom transition
cp.transition((tm) => {
  tm.goToRegion(
    {
      height: 200,
      width: 200,
      x: 200,
      y: 200,
    },
    {
      transition: {
        easing: cp.easingFunctions().easeOutExpo,
        duration: 2000,
      },
    }
  );
});
```

There is also `getZoom()` , `getMaxZoom()`, `getMinZoom()`, on the web component
too, in addition to `getScaleInformation()` which returns them all
(max/min/current).

## Reacting to Movement

The goal is to know where the viewport is. So in Atlas there are smooth
transitions, and as such when something is transitioning there will be a lot of
changes in where the viewport is. There are 2 separate attributes covering this:

- `move-events="true"` - this attribute will enable the move event, since it is
  noisy
- `granular-move-events="true"` - this will enable granular (requires above too)

Since there are so many events, the firing of them is completely opt-in\*. The
new event is:

```js
el.addEventListener("move", (e) => {
  e.detail.x;
  e.detail.y;
  e.detail.width;
  e.detail.height;
  e.detail.lastX;
  e.detail.lastY;
  e.detail.points;
});
```

## Selecting

- Clicking a particular point
- Clicking a particular point that is the target of an annotation that the
  component has rendered

Clicking on the canvas:

```js
cp.applyHTMLProperties(canvas, { onClick: () => void });
```

or..

```js
cp.events.addEventListener(canvas, "onClick", () => {
  // event.
});
```

Clicking on an annotation:

(reference the annotation example to show a click event)

See [Loading Annotation Pages](annotations#loading-annotation-pages)

Extra DEMO:

- select an annotation and display a sidebar
- Click on the canvas and display simple coordinates.

## Error(s)

If CanvasPanel has an issue loading a canvas, it should fire a `cp-load-error`
event with a `message` and `error` property.

## Content State

Canvas Panel provides some basic methods for getting and setting the current
content state.

### Requesting the Content State

You can request the current contentState for both canvas and sequence panels
using the `getContentState` method:

```js
// requests the current content state and should retain the current canvas, sequence, zoom, and pan information
const contentState = cp.getContentState();
/* should return:
 * {
    contentState: {
      id: "https://media.getty.edu/iiif/manifest/canvas/bb72d5f1-e230-4797-a7dc-262bf948b256.json#xywh=231.7202606201172,4818.99951171875,4256.003860473633,1183.5966796875",
      partOf: [ 
        {
          id: "https://media.getty.edu/iiif/manifest/1e0ed47e-5a5b-4ff0-aea0-45abee793a1c"
          type: "Manifest"
        }
      ],
      type: "Canvas"
    },
    encodedContentState: "JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRm1lZGlhLmdldHR5LmVkdSUyRmlpaWYlMkZtYW5pZmVzdCUyRmNhbnZhcyUyRmJiNzJkNWYxLWUyMzAtNDc5Ny1hN2RjLTI2MmJmOTQ4YjI1Ni5qc29uJTIzeHl3aCUzRDIzMS43MjAyNjA2MjAxMTcyJTJDNDgxOC45OTk1MTE3MTg3NSUyQzQyNTYuMDAzODYwNDczNjMzJTJDMTE4My41OTY2Nzk2ODc1JTIyJTJDJTIydHlwZSUyMiUzQSUyMkNhbnZhcyUyMiUyQyUyMnBhcnRPZiUyMiUzQSU1QiU3QiUyMmlkJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZtZWRpYS5nZXR0eS5lZHUlMkZpaWlmJTJGbWFuaWZlc3QlMkYxZTBlZDQ3ZS01YTViLTRmZjAtYWVhMC00NWFiZWU3OTNhMWMlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTWFuaWZlc3QlMjIlN0QlNUQlN0Q",
    normalisedContentState: {
      extensions: {
        id: "vault://virtual-annotation/1712607244986",
        motivation: ["contentState"],
        target: [ 
          {
            type: "Annotation"
          }
        ]
      }
    }
  }
*/
```

The _encodedContentState_ can then be used to reload the Content State for
Canvas Panel

### Setting the Content State

If you have an encodedContentState, you can set the content state directly on
Canvas Panel or Sequence Panel using `setContentStateFromText`.

```js

cp.setContentStateFromText('JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRm1lZGlhLmdldHR5LmVkdSUyRmlpaWYlMkZtYW5pZmVzdCUyRmNhbnZhcyUyRmJiNzJkNWYxLWUyMzAtNDc5Ny1hN2RjLTI2MmJmOTQ4YjI1Ni5qc29uJTIzeHl3aCUzRDIzMS43MjAyNjA2MjAxMTcyJTJDNDgxOC45OTk1MTE3MTg3NSUyQzQyNTYuMDAzODYwNDczNjMzJTJDMTE4My41OTY2Nzk2ODc1JTIyJTJDJTIydHlwZSUyMiUzQSUyMkNhbnZhcyUyMiUyQyUyMnBhcnRPZiUyMiUzQSU1QiU3QiUyMmlkJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZtZWRpYS5nZXR0eS5lZHUlMkZpaWlmJTJGbWFuaWZlc3QlMkYxZTBlZDQ3ZS01YTViLTRmZjAtYWVhMC00NWFiZWU3OTNhMWMlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTWFuaWZlc3QlMjIlN0QlNUQlN0Q').
```

When you set the Content State:

1. Canvas Panel can only load the content state for a manifest that has already
   been loaded into Vault and Atlas.
2. the `world-ready` event should have already fired to ensure that the
   appropriate information is available in the system.

## Target selection

Canvas Panel can be put in a mode where instead of panning the viewport, drag
and selection operations will draw a box. The box captured by this action is
provided with directly accessible properties (x, y, w, h) but also as a
ready-made encoded IIIF Content State.

```js
cp.enableContentStateSelection((selection) => {
  // handle selection
  console.log(selection.contentState); // the content state annotation
  console.log(selection.encodedContentState); // the same, encoded
});
// user can make multiple selections while cp is in this mode.
// As well as the event handler, all selections are available in a _stack_ on this property:
for (selection of cp.selections) {
  console.log(selection.contentState); // the content state annotation
  console.log(selection.encodedContentState); // the same, encoded
}
// it's also set initially to the whole canvas-in-manifest when entering selection mode
// Whenever a new canvas is loaded, a new selection entry is added.
// user clicks some other button (or toggle or whatever)
cp.disableContentStateSelection();
// lastSelectedContentState isn't cleared, it can sit there until overwritten
```

<!--
## Overview

 - _Any_ user interaction might be something the developer wants to respond to for some reason
 - _Many_ user interactions aren't important and will be left unobserved by the developer's code in most scenarios (e.g., panning and zooming actions)
 - _Some_ click interactions could be left to the component - e.g., #13 a click on a rendered hyperlink could just bubble up to browser and cause a page navigation, _or_ developer might want to handle this explicitly through handling the event
 - _Some_ user interactions are meaningless unless the component is in a particular mode and being used to accept user input (e.g., in an annotation tool)
-->

## Text selection

This feature is still in development. See
[Handling Text](../future/handling-text) for more information.

<GitHubDiscussion ghid="16" />

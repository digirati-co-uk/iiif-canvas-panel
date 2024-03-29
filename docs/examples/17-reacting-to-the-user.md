---
sidebar_position: 16
---


# Reacting to the user
<!-- TODO: GH-110 -->

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

Canvas Panel can listen for most kinds of browser DOM events on the canvas surface, and raise events for your application code. As well as clicks and movement, events raised by the presence of IIIF features are also available, such as `choice`.

Raised events supply arguments that typically give you the position at which the event occurred, and references to the Vault data relevant to the event (e.g., a click on an annotation).


## Reacting to Zoom

Atlas has some internal events that it fires when changes occur in the viewer. The first thing that was done was a bridge to these. As such there are 2 new events (normal addEventListener + detail handling):
* `go-home`
* `zoom-to`  (in, out, scroll)

Additionally there is a 3rd event: `zoom` . The problem is that when the zoom-to event is fired, the viewport has only just started it's transition. It's very much a notification that "recently a zoom was initiated" more than a precise tracker. For this reason the zoom event.

This will fire once the current transitioning zoom has completed. It contains information on the max/min zoom and booleans for if we have reached the max/min (isMax, isMin). The zoom event also fires when you call zoom-to . It does not fire when a user creates a custom transition.

```
el.addEventListener('zoom', ev => {
  ev.detail.scaleFactor; // 0.123456
  ev.details.max; // 1
  ev.details.min; // 0.123456
  ev.details.isMin; // true
  ev.details.isMax; // false
  ev.details.factor; // if user initiated a zoom - the factor scaled
})
```

There is also `getZoom()` , `getMaxZoom()`  and `getMinZoom()`  on the web component too, in addition to `getZoomInformation()`  which returns them all (max/min/current).

## Reacting to Movement

The goal is to know where the viewport is. So in Atlas there are smooth transitions, and as such when something is transitioning there will be a lot of changes in where the viewport is. There are 2 separate attributes covering this:
* `move-events="true"` - this attribute will enable the move event, since it is noisy
* `granular-move-events="true"` - this will enable granular (requires above too)

Since there are so many events, the firing of them is completely opt-in*. The new event is:
```js
el.addEventListener('move', e => {
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
 - Clicking a particular point that is the target of an annotation that the component has rendered 
 
 Clicking on the canvas:
 ```js
 cp.applyHTMLProperties(canvas, { onClick: () => void });
 ```
 or..
 ```js
 cp.events.addEventListener(canvas, 'onClick', () => {
     // event.
 })
 ```
 
 
 Clicking on an annotation:
 
 (reference the annotation example to show a click event)
 
 See [Loading Annotation Pages](annotations#loading-annotation-pages)
 
 Extra DEMO: 
 - select an annotation and display a sidebar
 - Click on the canvas and display simple coordinates.
 

## Target selection and Content State

Canvas Panel can be put in a mode where instead of panning the viewport, drag and selection operations will draw a box.
The box captured by this action is provided with directly accessible properties (x, y, w, h) but also as a ready-made encoded IIIF Content State.

```js
cp.enableContentStateSelection(selection => {
    // handle selection
    console.log(selection.contentState); // the content state annotation
    console.log(selection.encodedContentState); // the same, encoded
});
// user can make multiple selections while cp is in this mode.
// As well as the event handler, all selections are available in a _stack_ on this property:
for(selection of cp.selections){
    console.log(selection.contentState); // the content state annotation
    console.log(selection.encodedContentState); // the same, encoded
};
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

This feature is still in development. See [Handling Text](../future/handling-text) for more information.


<GitHubDiscussion ghid="16" />

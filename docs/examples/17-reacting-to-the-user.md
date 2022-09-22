---
sidebar_position: 16
---


# Reacting to the user
<!-- TODO: GH-110 -->

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

Canvas Panel can listen for most kinds of browser DOM events on the canvas surface, and raise events for your application code. As well as clicks and movement, events raised by the presence of IIIF features are also available, such as `choice`.

Raised events supply arguments that typically give you the position at which the event occurred, and references to the Vault data relevant to the event (e.g., a click on an annotation).

<!-- Stephen: list events that reflect browser DOM events -->
<!-- get point relative to canvas (actually atlas world but...) -->
<!-- imperative version of box selector -- https://digirati.slack.com/archives/C9U6T4G92/p1646305168578719 -->

:::danger

The features on this page are still in development, this list is a work in progress.

:::

## Movement

Movement - panning and zooming

**TODO: IMPLEMENT THIS API:**

```js
cp.addMovementListener(bounds => {
    console.log(bounds.x, bounds.y, bounds.width, bounds.height);
}, /* Poll rate */ 150);
```


## Selecting

 - Clicking a particular point (SF: Clicking on the canvas itself to get the x/y points?)
 - Clicking a particular point that is the target of an annotation that the component has rendered (SF: This can be achieved with adding an Annotation.onClick)
 
 Clicking on the canvas:
 
 cp.applyHTMLProperties(canvas, { onClick: () => void });
 
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

This feature is still in development. See [Handling Text](handling-text) for more information.


<GitHubDiscussion ghid="16" />

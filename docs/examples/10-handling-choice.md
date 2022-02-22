---
sidebar_position: 10
---

# Handling Choice

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

A Canvas have have multiple images. Sometimes, they are all a part of the scene to be rendered and the developer doesn't have to do anything extra - Canvas Panel will just render the scene.

But sometimes, the multiple images form a set of choices, for the user to pick from. Multispectral images are an example of this.

For further details on this scenario, see the IIIF Cookbook [Choice example](https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/). (TODO - replace with published link)

You don't necessarily need to know in advance that the Canvas has resources with Choice for something to render. In simple scenarios, you might not need to know, because there's nothing you can do about it anyway: let canvas panel make a sensible default choice, because anything more means you need to provide _more_ user interface to deal with the user making one or more choices. At the other end, your app might be sophisticated and allow blending of layers, e.g., to view multispectral captures of paintings.

For the more sophisticated UI, you need to react to the presence of one or more Choices on the canvas. You need to know what choices are available - their labels, ids and their "stacking" order.

You can then render UI for offering the choices to the user - and react to that choice by telling Canvas Panel to update the scene to reflect changes. Your UI component might be _bound_ to Canvas Panel.

You might also support blending: "Show the choice with id xxx at 80% opacity AND show the choice with id yyy at 50% opacity, all the others are at 0%".

Usually, if Choice is present at all, it's only one set of choices, for the whole canvas. But it's possible for a scene to be made of multiple content resources each of which have their own set of choices.

## Simple scenario - known choice

<!-- TODO: GH-106 -->
```html
<canvas-panel iiif-content="http://example.org/canvas-1.json" choice-id="http://example.org/choice-1" />
```

<canvas-panel 
    manifest-id="https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/manifest.json"
    canvas-id="https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/canvas/p1"
    choice-id="https://iiif.io/api/image/3.0/example/reference/421e65be2ce95439b3ad6ef1f2ab87a9-dee-xray/full/max/0/default.jpg" />


Here the value of `choice-id` is the `id` of the content resource within a set of choices. You don't need to specify which set of choices, in the rare event that there is more than one - although you can specify more than one value:

```html
<canvas-panel iiif-content="http://example.org/canvas-1.json" 
   choice-id="http://example.org/choice-set-a/3, http://example.org/choice-set-b/7" />
```

## Before loading

Before you put the `<canvas-panel />` web component on a page, you can first load the manifest into the vault, find out if there is a choice and render a UI.

TODO: update this to reflect current API
React example: https://codesandbox.io/s/sweet-zhukovsky-cz4p3?file=/src/App.js 

Make non-react version of this ^^
Also show React version


cp.setDefaultChoiceIds(ids);
cp.makeChoice(id, options)



```js
vault.loadManifest('http://example.org/manifest.json').then(manifestRef => {
   // At this point I know the canvas is loaded.
   // assume we are showing a particular canvas:
   const canvas = vault.fromRef({ id: 'http://example.org/manifest/canvas-1.json', type: 'Canvas' });

  if (vault.containsChoice(canvas)) {
    const choiceSets = vault.extractChoiceSets(canvas); // Array<{ annotation: {}, choices: Choice[] }>
    // Render UI for choices.
    // When I'm ready, I can insert a web component onto the page:
    // <canvas-panel canvas-id=" ... " choice-id=" ... " />
  } else {
    // Render normal component
    // <canvas-panel canvas-id=" ... " ... />
  }
});
```

This gives complete flexibility over choices at the data level, and can happen before anything is rendered to the user.

### After loading

In most cases, you won't want to handle a choice until you come across one:

```html
<canvas-panel id="viewer" canvas-id="http://example.org/canvas-1.json" [ ... ] />

<script>
  const viewer = document.getElementById('viewer');

  // TODO - this API is not confirmed
  viewer.addEventListener('canvas-choice', (helper) => {
    helper.choices // the choices in the IIIF form.

    helper.renderChoice(helper.choices[0]); // render a single choice (hiding any others)
  
    helper.renderChoice([helper.choices[0], data.choices[1]]); // Or render multiple
  
    helper.setOptions(helper.choices[0], { opacity: 20 }); // Something to pass directly to the rendering
    helper.setOptions(helper.choices[1], { opacity: 80 });

    return function() {
      // An unsubscribe callback for when the UI can be removed.
    };
  })
</script>
```
When that event fires, as a developer I can render my own UI from that data and bind `renderChoice` to buttons to control the viewer. This UI could appear only when a canvas has a choice and the user could use the UI created to switch between them. With the returned function, that UI could be cleaned up if the canvas is switched.

Since the `choice-id` attribute also drives this, I could do the following to manually set the choice ID.

```js
element.setAttribute('choice-id', 'http://example.org/choice-1')
```


<GitHubDiscussion ghid="10" />
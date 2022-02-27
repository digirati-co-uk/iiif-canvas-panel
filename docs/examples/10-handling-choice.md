---
sidebar_position: 10
---

# Handling Choice

import { GitHubDiscussion } from "../../GitHubDiscussion.js";
import choicesReactSandbox from '@site/sandboxes/choices-react.csb/_load';
import simpleChoice from '@site/sandboxes/10-choices/simpleChoice.csb/_load';
import choice1 from '@site/sandboxes/10-choices/choice1.csb/_load';
import { Sandbox } from '@site/Sandbox';

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

<Sandbox stacked project={choice1} />


Here the value of `choice-id` is the `id` of the content resource within a set of choices. You don't need to specify which set of choices, in the rare event that there is more than one - although you can specify more than one value:

```html
<canvas-panel iiif-content="http://example.org/canvas-1.json" 
   choice-id="http://example.org/choice-set-a/3, http://example.org/choice-set-b/7" />
```

## Before loading

Before you put the `<canvas-panel />` web component on a page, you can first load the manifest into the vault, find out if there is a choice and render a UI.

In this example, the "choice" event is fired when Canvas Panel detects that a Choice is present on the rendered Canvas.

:::tip

The choice event may be fired multiple times as Canvas Panel loads

:::

<Sandbox project={simpleChoice} />

Canvas panel also has the additional helpers for scenarios where you don't want to react to the choice event:

```js
cp.setDefaultChoiceIds(ids);
cp.makeChoice(id, options)
```

And you can render a choice directly, with opacity, via attributes (e.g., if generating the markup on the server):

```html
<canvas-panel iiif-content="http://example.org/canvas-1.json" choice-id="http://example.org/choice-1#opacity=0.5" />
```

## Choice React Example

This is a more realistic use of Canvas Panel's choice-handling capability:


<Sandbox project={choicesReactSandbox} />

:::danger

## Additional choice helper API

The following section is still under development

:::

You might want to analyse the canvas even earlier, to decide what UI to render. Canvas Panel provides some helpers for this:

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

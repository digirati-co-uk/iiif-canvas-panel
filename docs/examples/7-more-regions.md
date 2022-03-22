---
sidebar_position: 7
---

# More with regions

import { GitHubDiscussion } from "../../GitHubDiscussion.js";
import more2 from '@site/sandboxes/07-more-regions/more2.csb/_load';
import more3 from '@site/sandboxes/07-more-regions/more3.csb/_load';
import { Sandbox } from '@site/Sandbox';

![Excerpt from exhibition catalogue](../../static/img/examples/riley.png)

This image shows the sort of widget that might be used in a content management system, where the editor can select either a whole image (the top one) or a detail of a larger image (the bottom one), and accompany that image with some additional HTML.

This is an example of using Canvas Panel as a component of _some other piece of software_ - Canvas Panel itself doesn't render the additional markup - that's the component you write. Canvas Panel takes care of rendering a canvas, or some part of a canvas.

## Using content state

In the following, `https://iiif-canvas-panel.netlify.app/extra-fixtures/boy-with-straw-hat.json` is a content state at a URL. This will have been made by an editor at content-creation time, using a [Content State Selector](../../docs/applications/content-state-selector). It's a full JSON content state that looks like this:

```json
{
  "type": "Annotation",
  "motivation": ["contentState"],
  "target": {
    "id": "https://iiifmediawiki.herokuapp.com/presentation/canvas/c208117.json#xywh=50,990,2100,1755",
    "type": "Canvas",
    "partOf": [
      {
        "id": "https://iiifmediawiki.herokuapp.com/presentation/File:Baigneurs_a_Asnieres.jpg",
        "type": "Manifest"
      }
    ]
  }
}
```

The content-management template author will then produce code that will output something like this:

```html
<div class="canvas-figure">
    <canvas-panel 
          preset="responsive"
          iiif-content="https://iiif-canvas-panel.netlify.app/extra-fixtures/boy-with-straw-hat.json"
           />
    <p class="figure-text">
       Fig. 75<br/>
       Georges Seurat (1859-1891)
       <strong>Bathers at Asnières 1884 (detail)</strong><br/>
       <em>Oil on Canvas</em><br/>
       24.1 × 31.1 cm (9 1/2 × 12 1/4 in.)<br/>
       The National Gallery, London<br/>
    </p>
</div>
```

That is, the content-managed data for this widget is the figure text, and a content state pointing to the relevant part of an IIIF resource.

As the template author has the content state handy, they can use it to create a link to another page that would let the user explore the painting in mode detail (but still initialised on the boy-with-straw-hat detail):

```html
<a href="https://getty.edu/iiif-viewer?iiif-content=https://iiif-canvas-panel.netlify.app/extra-fixtures/boy-with-straw-hat.json">View this painting</a>
```

or, make the canvas panel image the link:

```html
<a href="https://getty.edu/iiif-viewer?iiif-content=https://iiif-canvas-panel.netlify.app/extra-fixtures/boy-with-straw-hat.json">
    <canvas-panel 
          preset="responsive"
          width="300"
          iiif-content="https://iiif-canvas-panel.netlify.app/extra-fixtures/boy-with-straw-hat.json"
           />
</a>
```

<Sandbox stacked project={more2} />


## Not using content state

An alternative would be where the developer has the region and IIIF information to hand directly, in which case they don't need a stored content state, or they are using the info from the content state directly:

<Sandbox stacked project={more3} />

<GitHubDiscussion ghid="7" />
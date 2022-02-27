---
sidebar_position: 12
---

# Highlights - showing boxes on the Canvas

import { GitHubDiscussion } from "../../GitHubDiscussion.js";
import highlight1 from '@site/sandboxes/12-boxes/highlight1.csb/_load';
import annoDisplay from '@site/sandboxes/12-boxes/annoDisplay.csb/_load';
import { Sandbox } from '@site/Sandbox';


## Scenario

You want to highlight a region of the Canvas, and style the way you highlight it. You might have already initially constrained the viewport to a particular part of the canvas (as in [Regions](./regions)).

Consider Canvas Panel showing a painting:

```html
<canvas-panel
   canvas-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/116"
   manifest-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest"
/>
```

<canvas-panel
   canvas-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/116"
   manifest-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest"
/>

Then showing a detail via the addition of a `region` attribute:

```html
<canvas-panel
   canvas-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/116"
   manifest-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest"
   region="1105,1548,701,720"
/>
```

<canvas-panel
   canvas-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/116"
   manifest-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest"
   region="1105,1548,701,720"
/>

Then **highlighting something** within that detail:


<Sandbox stacked project={annoDisplay} />

This example shows one way of styling something inside canavas panel. The `.example-annotation` style is not accessible within the web component; we have to pass a reference to a stylesheet into Canvas Panel to enable it to access styles. This boundary layer between the canvas panel web component and its containing page is necessary, otherwise canvas panel could be inadvertently disrupted by the containing page CSS.

:::tip

The CSS classes are not part of Canvas Panel, they are in your styles under your control.

There is a more detailed [discussion on styling](./styling) in Canvas Panel.

:::

In the above examples, the `region` and `highlight` attributes both take string values that can be transformed to [Target](./annotations#target) objects. `highlight` is a convenience attribute, with a convenience CSS assistant; in code you are doing something more general - you are adding an annotation to the canvas that appears as a highlight. This common scenario can be done programmatically:


<Sandbox stacked project={highlight1} />

For more information on this, see [Annotations](./annotations).

<GitHubDiscussion ghid="12" />
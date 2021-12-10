---
sidebar_position: 5
---

# Showing a region of the Canvas

import { GitHubDiscussion } from "../../GitHubDiscussion.js";


I want to render just a _part_ of an image (an `xywh` region).

This might be part of a Canvas, or a region of an image service (see #1 (comment)).

The provision of the target is the same as in the comment linked above: if it's a content state it handles it itself. If it's a canvas or image service, we need to specify a region to constrain to.

If rendering as a simple static or responsive image, we don't need additional behaviour (?).
But if rendering as deep zoom, that implies you can zoom within the viewport provided; but we might want to prevent you panning outside the initial region (or might allow it, as required).
Similarly what happens if a full-screen mode is available and you activate it? What fills the screen and what are the constraints on panning?


```html
// best-fit this region of the source image service into whatever the current viewport size is
<img-service src="http://..." region="900,900,1000,1000" />
<img-service src="http://..." region="pct:25,25,50,50" />

// template developer has a canvas id within a manifest
<canvas-panel
   iiif-content="https://..canvas_id.."
   partof="https://..manifest_id.."
   region="pct:25,25,50,50">
</canvas-panel>

// The canvas-in-a-manifest might be wholly supplied by a content state:
<canvas-panel
   iiif-content="https://..content_state.."
   region="pct:25,25,50,50">
</canvas-panel>

// And if that content state is a region of the canvas, then it's all you would need:
<canvas-panel
   iiif-content="https://..content_state..">
</canvas-panel>
```

For all render modes, if the `target` of that content state was a region of canvas (e.g., `..#xywh=900,900,1000,1000`), then it will initialise with that as a best-fit.

```html
// programmatically (applies to img-service too)

<canvas-panel id="cp"></canvas-panel>
<script>
   const vault = new Vault();
   const cp = document.getElementById("cp");
   await vault.loadManifest("..manifest_id..");
   cp.setCanvas("..canvas_id..");
   cp.setAttribute("region", "900,900,1000,1000");

   // you can also move the viewport later, e.g., in a narrative view:
   // ...time passes, handle a user action:   
   cp.setAttribute("region", "2000,1200,456,987");

  // remember that CP is always one canvas.
  // It might be a synthetic canvas that the developer made and composited 
  // other canvases and content onto, but it's always one canvas. That canvas is 
  // accessible via the vault.

  // although a shortcut?
  // let cv = cp.canvas; // equivalent of obtaining it from the vault?

  // Your app might be using a wrapping layout component, e.g., to layout a 
  // manifest as a strip (with zones) so you don't have to explicitly do the
  // compositing, but that tag is probably not called canvas-panel even if it really
  // is canvas panel with an extra synthetic canvas compositing wrapper.

  
</script>   
```

As well as setting region via an attribute, you can also set it in code. The `region` attribute is a 2D-specific simplification of a more general `Target` helper class (see https://github.com/digirati-co-uk/iiif-canvas-panel/discussions/33#discussion-3509526). Here we are creating a Target instance ourselves to specify a part of the canvas.

```js

const tgt = new Target();
tgt.spatial.x = 2000;
tgt.spatial.y = 1200;
tgt.spatial.w = 456;
tgt.spatial.h = 987;

// also a useful helper constructor, when you have it in this form:

const tgt = new Target("xywh=2000,1200,456,987"); // same thing

cp.goToTarget(tgt);

// In this code approach, we can also specify the behaviour of the transition via options:

cp.goToTarget(tgt, { highlight: true, padding: 40 });
cp.goToTarget(tgt, { transition: "transform 500ms ease-out" });

// In the latter, the syntax of transition is the same as CSS transition
// https://developer.mozilla.org/en-US/docs/Web/CSS/transition

``` 

For more on developing Annotation functionality, displaying annotations, and working with bodies and targets, see [Annotations](./annotations).


<GitHubDiscussion ghid="5" />
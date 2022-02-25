---
sidebar_position: 5
---

# Showing a region of the Canvas

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

TODO:
Work in https://codesandbox.io/s/frosty-bush-48h9t?file=/index.html

TODO: make all these examples work



Sometimes you want to render just a _part_ of an image (an `xywh` region).

This might be part of a Canvas, or a region of an image service. This can be specified with the `region` parameter, available on both `image-service` and `canvas-panel`:

If you just have an image service:

<!-- TODO: GH-69 -->
```html
<!-- best-fit this region of the source image service into whatever the current viewport size is -->
<image-service src="http://..." region="900,900,1000,1000" />
<image-service src="http://..." region="pct:25,25,50,50" />
```


If you have a canvas ID, within a manifest:

```html
<canvas-panel
   iiif-content="https://..canvas_id.."
   partof="https://..manifest_id.."
   region="pct:25,25,50,50">
</canvas-panel>
```

Another variation is a content state that supplies the canvas, but doesn't supply a region:

```html
<canvas-panel
   iiif-content="https://..content_state.."
   region="pct:25,25,50,50">
</canvas-panel>
```

And if that content state does supply the region itself, then it's all you would need:

```html
<canvas-panel
   iiif-content="https://..content_state..">
</canvas-panel>
```

In the example immediately above, that content state might expand to something like:

```json
{
  "@context": "http://iiif.io/api/presentation/0/context.json",
  "id": "https://example.org/import/1",
  "type": "Annotation",
  "motivation": ["contentState"],
  "target": {
     "id": "https://example.org/object1/canvas7#xywh=1000,2000,1000,2000",
     "type": "Canvas",
     "partOf": [{
        "id": "https://example.org/object1/manifest",
        "type": "Manifest"
     }]
   }
}
```

That is, region `1000,2000,1000,2000`, on the canvas `https://example.org/object1/canvas7`, which is in the manifest `https://example.org/object1/manifest`. (This example taken from [Content State specification](https://iiif.io/api/content-state/1.0/#41-a-region-of-a-canvas-in-a-manifest)).

If the `preset` behaviour of canvas panel is set to `static` or `responsive`, you don't need any additional attributes. But if rendering as deep zoom (the default `render`), that implies you can zoom within the _viewport_ provided; but we might want to prevent you panning outside the initial _region_ (or might allow it, as required).

TODO: add a !danger! Admonition about panning outside

TODO: tidy this up:
Similarly if a full-screen mode is available and the user activates it: what fills the screen and what are the constraints on panning? For all render modes, if the `target` of that content state was a region of canvas (e.g., `..#xywh=900,900,1000,1000`), then it will initialise with that as a best-fit, which might show areas outside the region.


Full screen is a user-land feature that could be added

See [common viewer features page](../../docs/applications/simple-viewer-with-common-features) 

## Setting regions programmatically

```html
<!-- This applies to image-service too -->
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
</script>   
```


> Canvas Panel always shows _one_ canvas. That canvas is accessible via the Vault. However, that canvas might be a _synthetic_ canvas that the developer  dynamically and composited other canvases and content onto. Your app might be using a wrapping layout component around Canvas Panel, e.g., to layout a manifest as a strip (with zones) so you don't have to explicitly do the compositing.

## Introducing Targets

TODO: rework this section, remove Target class
Come back to it when we have more than one kind of target - point targets, temporal targets

use the simplified goToTarget(..)

also mention cp.clearTarget(), cp.goHome()



As well as setting region via an attribute, you can also set it in code. The `region` attribute is a 2D-specific simplification of a more general `Target` helper class (see [Target](../../docs/components/cp) in the Canvas Panel Type documentation). Here we are creating a Target instance ourselves to specify a part of the canvas.

```js
const tgt = new Target();
tgt.spatial.x = 2000;
tgt.spatial.y = 1200;
tgt.spatial.w = 456;
tgt.spatial.h = 987;
```

You can also construct a target from the `xywh` string format commonly found in annotations:

```js
const tgt = new Target("xywh=2000,1200,456,987"); // same thing as above
```

Then make Canvas Panel focus on this target:

<!-- TODO: GH-70 -->
```js
// VALID:
goToTarget({ x: 0, y: 0, width: 100, height: 100 });
goToTarget({ x: 0, y: 0, width: 100, height: 100 }, { immediate: true });
// https://digirati.slack.com/archives/C9U6T4G92/p1645529364653899


// old:

cp.goToTarget(tgt);

// In this code approach, we can also specify the behaviour of the transition via options:
cp.goToTarget(tgt, { highlight: true, padding: 40 });
cp.goToTarget(tgt, { transition: "transform 500ms ease-out" }); // not done yet... but will look like this

// In the latter, the syntax of transition is the same as CSS transition
// https://developer.mozilla.org/en-US/docs/Web/CSS/transition
``` 

For more on developing Annotation functionality, displaying annotations, and working with bodies and targets, see [Annotations](./annotations).


<GitHubDiscussion ghid="5" />
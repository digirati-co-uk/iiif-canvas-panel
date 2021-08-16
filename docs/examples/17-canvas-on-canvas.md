---
sidebar_position: 17
---

# Canvas-on-canvas annotations

From the developer point of view this is the same as the quick start. You won't necessarily know that canvas A has canvas B painted onto it (almost certainly amongst other content directly painted).

In any canvas-on-canvas scenario (for spatial and temporal), Canvas Panel translates all annotations on canvas B into the coordinate space of Canvas A, and then treats them the same as any other annotations on Canvas A.

Image Scenario:

Two canvases representing pages of books. Each canvas has text annotations.
You create a new, synthetic canvas for a 2-up view, paint the two canvases onto it, and render the new synthetic canvas using the component. It behaves exactly as if all the text annotations had been made directly on the synthetic canvas.

AV scenario:

Two chunks of video, each with text transcripts (captions), each represented by a canvas
Sequence them together so that one follows the other directly on the new canvas.

## Manual canvas-on-canvas composition


```html
<canvas-panel id="cp"></canvas-panel>
<script>

   const cp = document.getElementById("cp");
   const vault = cp.vault; // see #49
   await vault.loadManifest("https://iiif.wellcomecollection.org/presentation/b18035723");

   // make a 2-page spread
   let lhs = vault.FromRef("https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0007.JP2");
   let rhs = vault.FromRef("https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0008.JP2");

   // these are close enough not to require anything fancy done...
   console.log(lhs.width, lhs.height); // 2008, 2736
   console.log(rhs.width, rhs.height); // 2008, 2740

   const bigCanvas = new Canvas("https://example.org/synthetic-id");
   
   let lhsTarget = new Target();
   lhsTarget.spatial.x = 0;
   lhsTarget.spatial.y = 0;
   lhsTarget.spatial.w = lhs.width;
   lhsTarget.spatial.h = lhs.height;
   
   let rhsTarget = new Target();
   rhsTarget.spatial.x = lhs.width + 10; // a gutter of 10 canvas-units between them
   rhsTarget.spatial.y = 0;
   rhsTarget.spatial.w = rhs.width;
   rhsTarget.spatial.h = rhs.height;

   bigCanvas.paint(lhs, lhsTarget);
   bigCanvas.paint(rhs, rhsTarget);
   bigCanvas.setDimensionsFromContent(); // a utility method; will set bigCanvas.width and bigCanvas.height

   vault.load(bigCanvas); // should vault take the id from this by default?
   cp.setCanvas(bigCanvas.id);

</script>  
```

---
sidebar_position: 14
---

# Working with Annotations

import { GitHubDiscussion } from "../../GitHubDiscussion.js";
import vaultLoading from '@site/sandboxes/14-annotations/vaultLoading.csb/_load';
import annoPages from '@site/sandboxes/14-annotations/annoPages.csb/_load';
import { Sandbox } from '@site/Sandbox';

<!-- NB the original version of this doc ument has been moved to notes/14-annotations-hidden.md -->
<!-- It describes an internal Vault normalised annotation approach, which is not the same as v1 below. -->
TODO: work this in - https://digirati.slack.com/archives/C9U6T4G92/p1645532626064159

TODO...

```
Construct a regular anno (W3C anno) - WITH A TARGET (targets the canvas)
Add it to vault
make a cp anno with cp.createAnnotationDisplay(myW3CAnnoId);
give it styles, classes etc
give it event listeners
cp.annotations is per CP instance not per canvas
```

use the widget to get the W3C anno data
put CP in box-draw mode (Atlas-level API) so that you can capture the target rectangle

vault.load('https://iiif.wellcomecollection.org/presentation/b21146172/canvases/b21146172_0003.jp2/supplementing/t1', {
 "id": "https://iiif.wellcomecollection.org/presentation/b21146172/canvases/b21146172_0003.jp2/supplementing/t1",
  "type": "Annotation",
  "body": {
    "value": "As I stated in the conclusion of my \"Refutation of Certain Calumnies\"",
    "type": "TextualBody"
   },
   "motivation": "supplementing",
   "target": "https://iiif.wellcomecollection.org/presentation/b21146172/canvases/b21146172_0003.jp2#xywh=180,601,1481,53"
})
^ should work, needs tested

12:56

https://atlas-viewer-storybook.netlify.app/?path=/story/annotations--selection-demo

----



The underlying [Vault](../components/vault) library is opinionated about IIIF: it enables you to code directly against the IIIF Presentation 3.0 data model. To enable this, it provides helper functions and normalisation services, so that even if you load IIIF 2.1 resources, you can code against them as if they were version 3 resources. Vault gives you access to a managed, normalised IIIF 3 world, as if everyone's IIIF was perfectly on-spec and version 3.

In IIIF, content is associated with canvases through [Annotations](https://iiif.io/api/presentation/3.0/#56-annotation), using the [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/). This model has a wider scope than IIIF, and unlike the Presentation 3.0 specification it allows the same intention to be expressed in different ways. It's also JSON-LD 1.0, not 1.1 like IIIF. With annotations, there's no further specification to normalise the data to.

We can still program against annotations in Vault, and use them with Canvas Panel, but (in the current code) Vault cannot coerce every _possible_ annotation into normalised types.

You can add an annotation to the Vault, and you can add whole annotation pages at a time to the Vault. Annotations can be provided as inline JSON, or can be loaded from URLs.


The following sandbox shows a few patterns for working with annotations - both existing annotations, and new ones that you add to Vault.

<Sandbox stacked project={vaultLoading} />


## Annotation Display

Like the IIIF resources, annotations loaded into Vault are just data. Canvases in vault become visible when given to Canvas Panel - so what about annotations?

Canvases are intended for presentation (that's what IIIF is for), so the media to show and where to show it are governed by that specification. In IIIF the media are associated with the Canvases via Annotations, with the special motivation property of `painting`.

Other types of Annotations in IIIF need a bit more work to become user interface. For content like comments, transcriptions, tags, highlights, descriptions and all the other types of possible annotation, we need to consider a few things before rendering them.

 - There might be a very large number of annotations on a canvas - thousands even. We shouldn't just show them all.
 - If we do show an annotation, what does it look like? Can we style it with CSS? W3C annotations don't typically have any style information associated with them.
 - In IIIF, Annotations are grouped into AnnotationPages. We will often want to load and style all of the annotations on a page in one go.


Canvas Panel provides an additional class, `AnnotationDisplay`, that turns an annotation-as-data in Vault to an annotation as a visible UI element on the Canvas. `AnnotationDisplay` represents the Annotation _rendered in the user interface_ - the element rendered on the canvas surface, that might have styles, behaviours and user interaction events. 

> `AnnotationDisplay` is where the W3C Model meets the DOM in the browser

A W3C `Annotation` can't have a CSS Class, but the Canvas Panel `DisplayAnnotation` that wraps it can.

<!--Canvas Panel also defines `TransitionOptions` - a class used to define how the canvas navigates from one Annotation or state to another, e.g., for guided viewing.-->

<!-- removed sections on Target and Body classes - see /notes/14-annotations-hidden.md -->

## Loading Annotation Pages


<Sandbox stacked project={annoPages} />


## Canvas Panel's managed annotations

TODO - update from Slack https://digirati.slack.com/archives/C9U6T4G92/p1645532626064159

TODO - cp.annotations page

todo cp.annotations is CP's own managed list of displayable, interactive (potentially) annotations

For displaying an Annotation on the Canvas, you wrap it in a `DisplayAnnotation`.  (no!!)

The Vault doesn't know anything about this class. It belongs to Canvas Panel. `DisplayAnnotation` provides properties that help you style annotations, react to events on them, manage their visibility on the canvas, and other utility / extensions.

:::info
If you want total control of what you draw on the canvas, outside of IIIF and annotations, you can step down into Atlas and access the _world_ directly. But for general annotation scenarios - including annotation creation and editing as well as tags, links, descriptions, markers, highlights... the `DisplayAnnotation` provides common functionality using a consistent Annotation model for associating content with the canvas. It can be made interactive, allowing it to be positioned and re-sized by the user. Canvas Panel is deliberately not a general-purpose drawing surface, it's for IIIF+Annotation scenarios.
:::

### Honorary annotations - METS-ALTO, hOCR and WebVTT

:::danger

This feature is still under development, it is not available in released versions.

:::

It's common for IIIF canvases to link to non-IIIF formats containing text. 

Vault allows you to load these _as if they were annotations_ and program against them through the Annotation/Target/Body classes for consistency. If it finds it linked from the Canvas, Canvas Panel will expose WebVTT to `<video>` and `<audio>` tags, but you might want to do additional things with the text, without parsing WebVTT yourself, instead parsing as W3C annotations for consistency.

You can also add external text formats as annotations, using a Vault helper:

```js
const annoPage = helper.importWebVTTAsAnnotations('https://example.org/web-vtt', {target: 'https://example.org/canvas-id' });
```

See [Text Handling](./handling-text) for further information.


## DisplayAnnotation details

One major role of Canvas Panel is simply rendering scenes - passing a canvas in and relying on Canvas Panel to render all the painting annotations. Occasionally that requires some user interaction - when the painting anno has a Choice body - but usually, the point of Canvas Panel is to forget about this.

The other major part of Canvas Panel is working with annotations - displaying them, even allowing users to create them.

DisplayAnnotation has properties and events that relate to the visual (and/or audible) canvas - selection, resize, click. If you used Canvas Panel as part of an annotation creation tool, you'd be allowing the user to create new `DisplayAnnotation` instances.

When displaying existing annotations (like the ones loaded above), you wrap them with a `DisplayAnnotation` to make them visible to the user. You can optionally allow the user to resize or reposition the `DisplayAnnotation` - its internal Target object would update as the user does this, as well as the visual size and position changes on the canvas surface.

Canvas Panel knows what DisplayAnnotations are on it at any moment. Canvas Panel manages the ordered list of DisplayAnnotations for you. You can inspect this list and manipulate it, for example moving DisplayAnnotations to change the visible stacking order.

If you allowed all of the annotations that come referenced from a manifest to be wrapped and displayed then they'd all be on the canvas and accessible. The developer has access to all the actual annotations via Vault, and might want to be selective about which ones become visible on the canvas and when.

Continuing the example above:

```html
<canvas-panel id="cp"><canvas-panel>
<script>
  // ... ommitted repeat of earlier example
  const myAnno = annoPage.items[3];
  const myDisplayAnno = new DisplayAnnotation(myAnno);
  myDisplayAnno.cssClass = "red-box";
  cp.DisplayAnnotations.add(displayAnno);
  myDisplayAnno.addEventListener("click", (anno, args) => { .. }); // ??

  myDisplayAnno.draggable = true; // can be moved on the canvas
  myDisplayAnno.resizable = true; // Canvas Panel renders handles, allows resizing
</script>
```

TODO: need to work out how Manifest Editor would do this - what does it need?
(Leave with Stephen!!)

A common pattern is drawing lots of annotations on the canvas at once, and wiring up event listeners for activity on those annotations. To do this, Canvas Panel supports a query API:

TODO - update this using the Vault walkthrough mechanism
```js
cp.query({
  type: "Annotation", // `DisplayAnnotation` here?
  motivation: "linking",
}).addEventListener("click", (e) => {
  // Handle the event here.
});
```

query first, then add event listener for normal events

```js
cp.query({
  type: 'Canvas',
  options: { choice: true }
}).addEventListener('load', () => {
 // ...
})
```

Canvas Panel won't draw annotations on the Canvas unless you tell it to, apart from the `painting` motivation annotations which it must draw because they are part of the scene. Any other annotations are _not_ part of the scene, but may still be rendered on the canvas surface - e.g., a [highlight](./drawing-boxes) or a [link](rendering-links).

:::info
Turning linked annotations into displayed annotations is mostly done via code rather than attributes, with the exception of helpers for simple scenarios such as highlighting. It's more flexible to do this in code.
:::

## Typical scenarios

* On loading a canvas, follow the annotation links and inspect some of the motivations to determine what they are; present UI that uses the AnnotationPage labels to allow a user to load different lists and display them, where appropriate
* Decide to use OCR "honorary" annotations mentioned above for text functionality rather than line-level supplementing annotations

Additional links:

See events introduction at https://github.com/digirati-co-uk/iiif-canvas-panel/discussions/45#discussioncomment-1164643
[See Annotation Library (gist)](https://gist.github.com/stephenwf/b04b60f2cef22f43cd985f5983587e37)

## More on constructing DisplayAnnotations

:::caution
This is still mostly a discussion - see https://github.com/digirati-co-uk/iiif-canvas-panel/discussions/33#discussioncomment-1163791
:::

The underlying Annotation is constructed by Hyperion/Vault from a W3C annotation directly (because it's come from some IIIF). It will be strongly-typed, depending on motivation:

 - LinkingAnnotation
 - TaggingAnnotation
 - etc

There might not be a lot of difference between these classes - they'll have different motivation properties, but many of them will have similar targets and many will have similar bodies.

(Do we really need them? Just inspect motivation(s))?

While Target is probably the same class, bodies can be `TextualBody` (which can take HTML too), `IIIFResourceBody` (links to other IIIF resources or parts of), `ResourceBody` (links to other web resources like text/html pages, application/pdf document, etc).

In the [linking example](rendering-links) it's shown how the DisplayAnnotation constructor can take additional options to control handling of annotation bodies. For example if the linking annotation has a body that is part of a IIIF resource, you might want the generated hyperlink the end user clicks on to point to a viewer that loads that resource via a content state - you need a helper to transform that, CP won't know.

But can be constructed from Hyperion helper classes

How far do we want to go with default behaviour?

```js
let dispAnno = new DisplayAnnotation("<any HTML>");
// now you can position dispAnno, have the user move it around...

// that's probably too loose. But:
const anno2 = new DescribingAnnotation("describing"); 

// its position and content are determined by the backing annotation:
anno2.target = new Target("xywh=2000,2000,1000,1000");
anno2.body = new HtmlBody("<any HTML>");
vault.load("xxx", anno2);

// but its style is at the DisplayAnnotation level
let dispAnno = new DisplayAnnotation(anno2, { cssClass: "desc" });
cp.displayAnnotations.add("xxx"); // add via vault ref?
``` 

A DisplayAnnotation has an annotation, and the annotation has Body and Target properties, where these are helper classes that help with the underlying W3C model variability.

Body and Target are probable subclasses of some other resource.

in [linking example](rendering-links) there's an example of `body.getContentState()` but a Target could have that too; there's some base class. A body might be a plain string, or a plain hyperlink.

## Intermediate annotations

Need an example for https://github.com/digirati-co-uk/iiif-canvas-panel/issues/94#issuecomment-996670694

## More on annotation style and CSS

In previous examples, a CSS class has been applied to a DisplayAnnotation like this:

```js
const displayAnno = new DisplayAnnotation(vault.FromRef("my-anno"));
displayAnno.cssClass = "red-box";
```

...where your CSS has a selector for `.red-box` that perhaps sets border and background styles.

This works as you might expect it to - the DisplayAnnotation is an HTML Element in the DOM within Canvas Panel, and the styles are applied directly by the browser.

This works simply and well for a small number of annotations, but is inefficient for scenarios involving bulk display of a very large number of annotations.

For example, you can load and display an entire annotation page at once that may contain many thousands of boxes round individual words, or highlights on a biological specimen. In these cases it is more efficient for the boxes to be drawn directly by Canvas Panel, rather than as HTML elements that can pick up styles from your own stylesheets.

These annotations can still be styled, but not by picking up your CSS directly (they are not HTML elements).

Instead, they can use a subset of styling information set in a CSS-like syntax:


```js
// TODO - example of loading a whole anno page (also needed for previous section)
// Also wire up some mouse over and click handlers here.
```

This approach is explained in more detail in [Working with Annotation Pages](./annotations-in-bulk).

It is possible to create DisplayAnnotations as before, but style them using the optimised, non-HTML technique. This way they do not become HTML elements:

```js
const displayAnno = new DisplayAnnotation(vault.FromRef("my-anno"));
displayAnno.applyStyle({
  backgroundColor: 'red',
  border: '1px solid blue',
});
```

It's the application of direct, CSS styles that makes a display annotation an HTML element; without CSS styles it can still be drawn on the Canvas, and styled with a reduced set of options.

<GitHubDiscussion ghid="33" />
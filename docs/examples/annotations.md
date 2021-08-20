---
sidebar_position: 14
---

# Working with Annotations

The underlying Hyperion framework is opinionated about IIIF: it enables you to code directly against the IIIF Presentation 3.0 data model. To enable this, it provides helper functions and normalisation services, so that even if you load IIIF 2.1 resources, you can code against them as if they were version 3 resources. Hyperion+Vault gives you access to a managed, normalised IIIF 3 world, as if everyone's IIIF was perfectly on-spec and version 3.

In IIIF, content is associated with canvases through Annotations, using the W3C Web Annotaton Data Model. This model has a wider scope than IIIF, and unlike the Presentation 3.0 specification it allows the same idea to be expressed in different ways. It's also JSON-LD 1.0, not 1.1 like IIIF. With annotations, there's no further spec to normalise the data to, and using annotations directly reintroduces the overly defensive, always-checking style Hyperion aims to avoid.

For this reason, Hyperion _does_ expose annotations through its own type system. It can't hope to coerce every _possible_ annotation into its own types, but it does attempt to do this for annotation styles commonly encountered in IIIF development scenarios, especially (but not exclusively) annotations on canvases. Hyperion also gives you access to the original annotation fields if you really need them, but generally you shouldn't.

## Annotation Data

Hyperion will attempt to wrap any annotations it finds with its own Annotation class - or rather, an instance of a motivation-specific class:

 - `Annotation` - abstract annotation class
   - `HighlightingAnnotation`
   - `LinkingAnnotation`
   - `TaggingAnnotation`
   - ...

(This needs further brainstorming, dealing with multiple motivations)

The Annotation class makes use of two further helper classes:

 - `Body`
 - `Target`

These reflect the W3C Annotation Model's `body` and `target` properties, but are accessed via the properties `bodies` and `targets` (both _arrays_) on Hyperion's `Annotation` class.  Usually there is one of each, but there can be more than one _target_, more than one _body_, and also, no _body_. The original `body` and `target` properties are available as their original JSON-LD representations. 

Hyperion attempts to coerce the found annotation bodies and targets into normalised representations common in IIIF development. If it can't do this it leaves the W3C body or target as-is and doesn't add to the `bodies` or `targets` array.

## Annotation Display

As well as Hyperion providing types to help with annotation _data_, Canvas Panel provides a type to help with annotation _display_. That is, an annotation drawn on the canvas surface in some way, and potentially _interactive_.

  - `DisplayAnnotation`

The Hyperion classes represent the data - the annotation content, the canvas or part of canvas it targets. `DisplayAnnotation` represents the Annotation _rendered in the user interface_ - the element rendered on the canvas surface, that might have styles, behaviours and user interaction events. `DisplayAnnotation` is where the W3C Model meets the DOM in the browser. A W3C Hyperion `Annotation` can't have a CSS Class, but the Canvas Panel `DisplayAnnotation` that wraps it can.

Canvas Panel also defines `TransitionOptions` - a class used to define how the canvas navigates from one Annotation or state to another, e.g., for guided viewing.

## Target

**Target** is a standardised object representing a spatial and/or temporal target on a canvas, from the various forms that could take in Annotation JSON. Hyperion will parse these from W3C and Open Annotation content.

```json
"target": "http://example.org/canvas-1.json#xywh=1,2,3,4"
```

or

```
"target": { 
  "id": http://example.org/canvas-1.json", 
  "refinedBy": "#xywh=1,2,3,4" 
}
```

Parsing these results in an object with `.x`, `.y` properties:

`.target.spatial.x`, `.target.spatial.y`, `.target.spatial.w` ...

If the target is a point (defined by a PointSelector), then `target.spatial.w` and `target.spatial.h` are both 0, and `target.spatial.point` is `true` to make this explicit and easy to test for.

Where the targets are _temporal_, the helper classes have the following:

`.target.temporal.start`,`.target.temporal.end`, `target.temporal.point`

For the latter, `.point` is true and `.start` and `.end` have the same value.

A `Target` can have both spatial and temporal properties, for example if it targets part of a video for a certain amount of time.

You can also use create Target without an annotation. In [Regions](./regions), the last example shows the code moving the viewport to focus on a particular part, using `Target` and `TransitionOptions`.

As Vault loads annotations, it can keep track of where they were referenced from, so a concise form such as this annotation's target still evaulates to a useful object:

```json
{
  "id": "https://iiif.wellcomecollection.org/presentation/b21146172/canvases/b21146172_0003.jp2/supplementing/t1",
  "type": "Annotation",
  "body": {
    "value": "As I stated in the conclusion of my \"Refutation of Certain Calumnies\"",
    "type": "TextualBody"
   },
   "motivation": "supplementing",
   "target": "https://iiif.wellcomecollection.org/presentation/b21146172/canvases/b21146172_0003.jp2#xywh=180,601,1481,53"
}
```

```js
log(anno.target.spatial.x); // 180
log(anno.target.type); // "Canvas", because it came from a Canvas
const canvas = vault.fromRef(anno.target.id);
log(canvas); // { .. } (see below - assumes vault was already tracking the canvas before loading its annos)
```

## Body

A **Body** could be very similar to a target (e.g., a canvas in a manifest could be the body of a link annotation). But a body could be a URL, a textual body, and other kinds of resource. Hyperion doesn't have wrapper classes for every possible type of Target, but it will try to coerce the found Annotation body into one of its known types.

It will also attempt to coerce string values into a language map compatible with IIIF language maps.

For example, re-using the above annotation:

```js
log(anno.bodies[0].type); // "TextualBody"
log(anno.bodies[0].format); // "text/plain" - as no format has been given
log(anno.bodies[0].valueMap["none"]); // "As I stated in the conclusion of my \"Refutation of Certain Calumnies\""
```

In the last example, the language has been mapped to the special value "none" because no language was specified. However, you will often know the likely language of textual annotations that Vault is loading and can provide an alternative default. In this case, you would provide "en":

```js
vault.loadAnnotations("..linked anno page url..", { defaultLanguage: "en" });
```

:::question
How much of this can vault do unaided? In the above, we're manually loading the linked `annotations` from a canvas. Just loading them into vault on their own would be problematic because vault isn't tracking the canvas id in the `target`. You'd need to make sure the targets are loaded first.
:::

:::info
Need to list examples of the anno forms we want to support - ResourceBody (e.g., an mp3, an image), TextualBody (with embedded and external variants, format, language etc), IIIFResource (probably the same as Target).
These should align with the cookbook, if present there.
:::

## Annotation

As discussed above, **Annotation** is not _just_ a W3C Web Annotation, although you can create an instance from a W3C Anno in a constructor, and you can call `.toW3CAnnotation()` on an Annotation to get the W3C JSON representation.

`Annotation` is loaded and managed by the Vault. However it does not automatically follow and load all annotations linked from the manifest. For a printed book this could trigger potentially thousands of HTTP requests. Instead, you can listen for events that notify you that annotations are present, and then follow them on demand as necessary.

```html
<canvas-panel id="cp"><canvas-panel>
<script>
  const vault = HyperionVault.globalVault();
  const manifest = await vault.loadManifest(manifestId);
  // a viewer can work with this normalised Presentation 3 manifest
  const cp = document.getElementById("cp");
  let selectedCanvas = vault.fromRef(manifest.items[12]);
  cp.setCanvas(selectedCanvas.id);
  log(selectedCanvas.annotations.length); // 1 (in our case)
  const annoPage = await vault.loadAnnotations(selectedCanvas.annotations[0]);
  // same as ?
  // const annoPage = await vault.loadAnnotations(selectedCanvas.annotations[0].id);
  // same as ?
  // const annoPage = await vault.load(selectedCanvas.annotations[0]); // Vault can find out what they are
  // What if the anno page had been inline, and the id wasn't dereferenceable?
  // Vault would spot this and return the inline annotations, which it would already be tracking.
  // Otherwise it will follow the link and make an HTTP request
  const myAnno = annoPage.items[3];
  // or does it need to do this?...
  // const myAnno = vault.fromRef(annoPage.items[3]);
</script>

```

:::caution
We need to decide the whole pattern around anno loading and Vault. Does it unload them when no longer needed?

Need more examples of anno loading here.
:::


### Honorary annotations - METS-ALTO, hOCR and WebVTT

It's common for IIIF canvases to link to non-IIIF formats containing text. 

Hyperion allows you to load these _as if they were annotations_ and program against them through the Annotation/Target/Body classes for consistency. If it finds it linked from the Canvas, Canvas Panel will expose WebVTT to `<video>` and `<audio>` tags, but you might want to do additional things with the text, without parsing WebVTT yourself, instead parsing as W3C annotations for consistency.

See [Text Handling](./handling-text) for further information.


## DisplayAnnotation

For displaying an Annotation on the Canvas, you wrap it in a `DisplayAnnotation`.

The Vault doesn't know anything about this class. It belongs to Canvas Panel. `DisplayAnnotation` provides properties that help you style annotations, react to events on them, manage their visibility on the canvas, and other utility / extensions.

:::info
If you want total control of what you draw on the canvas, outside of IIIF and annotations, you can step down into Atlas and access the _world_ directly. But for general annotation scenarios - including annotation creation and editing as well as tags, links, descriptions, markers, highlights... the `DisplayAnnotation` provides common functionality using a consistent Annotation model for associating content with the canvas. It can be made interactive, allowing it to be positioned and re-sized by the user. Canvas Panel is deliberately not a general-purpose drawing surface, it's for IIIF+Annotation scenarios.
:::

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

A common pattern is drawing lots of annotations on the canvas at once, and wiring up event listeners for activity on those annotations. To do this, Canvas Panel supports a query API:

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
---
sidebar_position: 14
---

# Working with Annotations

The underlying Hyperion framework is opinionated about IIIF: it enables you to code directly against the IIIF Presentation 3.0 data model. To enable this, it provides helper functions and normalisation services, so that even if you load IIIF 2.1 resources, you can code against them as if they were version 3 resources. Hyperion+Vault gives you access to a managed, normalised IIIF 3 world, as if everyone's IIIF was perfectly on-spec and version 3.

In IIIF, content is associated with canvases through Annotations, using the W3C Web Annotaton Data Model. This model has a wider scope than IIIF, and unlike the Presentation 3.0 specification it allows the same idea to be expressed in different ways. It's also JSON-LD 1.0, not 1.1 like IIIF. With annotations, there's no further spec to normalise the data to, and using annotations directly reintroduces the overly defensive, always-checking style Hyperion aims to  ; it can offer different ways of expressing the same relationship; and is not JSON-LD 1.1. This can make it hard to continue with the same programming style when working with annotations on IIIF resources.

For this reason, Hyperion _does_ expose annotations through its own type system, and Canvas Panel has a special Type that represents a _displayed_ annotation - that is, an annotation drawn on the canvas surface in some way, and potentially _interactive_.

Hyperion will attempt to wrap any annotations it finds with its own Annotation class - or rather, an instance of a motivation-specific class:

 - `Annotation` - abstract annotation class
   - `HighlightingAnnotation`
   - `LinkingAnnotation`
   - `TaggingAnnotation`
   - ...

The Annotation class makes use of two further helper classes:

 - `Body`
 - `Target`

 These reflect the W3C Annotation Model's `body` and `target` properties, but are accessed via the properties `bodies` and `targets` on Hyperion's helper Annotation class. These are both arrays. Usually there is one of each, but there can be more than one _target_, more than one _body_, and also, no _body_.

 Hyperion attempts to coerce the found annotation bodies and targets into normalised representations common in IIIF development. If it can't do this it leaves the W3C body or target as-is.

 To these Hyperion classes, Canvas Panel adds its own extra wrapper:

  - `DisplayAnnotation`

The Hyperion classes represent the data - the annotation content, the canvas or part of canvas it targets. `DisplayAnnotation` represents the Annotation _in the user interface_ - the element rendered on the canvas surface, that might have styles, behaviours and user interaction events. `DisplayAnnotation` is where the W3C Model meets the DOM in the browser. A W3C Hyperion `Annotation` can't have a CSS Class, but the Canvas Panel `DisplayAnnotation` that wraps it can.

Canvas Panel also defines `TransitionOptions` - a class used to define how the canvas navigates from one Annotation or state to another, e.g., for guided viewing.


## Target

**Target** is a standardised object representing a spatial and/or temporal target on a canvas, from the various forms that could take in Annotation JSON. Hyperion will parse these from W3C and Open Annotation content.

```
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

## Body

A **Body** could be very similar to a target (e.g., a canvas in a manifest could be the body of a link annotation). But a body could be a URL, a textual body, and other kinds of resource. Hyperion doesn't have wrapper classes for every possible type of Target, but it will try to coerce the found Annotation body into one of its known types.

:::info

Need to list them - ResourceBody (e.g., an mp3, an image), TextualBody (with embedded and external variants, format, language etc), IIIFResource (probably the same as Target).

:::

## Annotation

As discussed above, **Annotation** is not _just_ a W3C Web Annotation, although you can create an instance from a W3C Anno in a constructor, and you can call `.toW3CAnnotation()` on an Annotation to get the W3C JSON representation.

`Annotation` is loaded and managed by the Vault. However it does not automatically follow and load all annotations linked from the manifest. For a printed book this could trigger potentially thousands of HTTP requests. Instead, you can listen for events that notify you that annotations are present, and then follow them on demand as necessary.

:::caution
We need to decide the whole pattern around anno loading and Vault. Does it unload them when no longer needed?

Need examples of anno loading here.
:::

### Honorary annotations - METS-ALTO, hOCR and WebVTT

It's common for IIIF canvases to link to non-IIIF formats containing text. 

Hyperion allows you to load these _as if they were annotations_ and program against them through the Annotation/Target/Body classes for consistency. Canvas Panel will expose WebVTT to `<video>` and `<audio>` tags, but you might want to do additional things with the text, without parsing WebVTT yourself.

See [Text Handling](./handling-text) for further information.


## DisplayAnnotation

For displaying an Annotation on the Canvas, you wrap it in a `DisplayAnnotation`.

The Vault doesn't know anything about this class. `DisplayAnnotation` provides properties that help you style annotations, react to events on them, manage their visibility on the canvas, and other utility / extensions.

If you want total control of what you draw on the canvas, outside of IIIF and annotations, you can step down into Atlas and access the _world_ directly. But for general annotation scenarios - including annotation creation and editing as well as tags, links, descriptions, markers, highlights... the `DisplayAnnotation` provides common functionality using a consistent Annotation model for associating content with the canvas. It can be made interactive, allowing it to be positioned and re-sized by the user. Canvas Panel is deliberately not a general-purpose drawing surface.

## DisplayAnnotation details

One major role of Canvas Panel is simply rendering scenes - passing a canvas in and relying on Canvas Panel to render all the painting annotations. Occasionally that requires some user interaction - when the painting anno has a Choice body - but usually, the point of Canvas Panel is to forget about this.

The other major part of Canvas Panel is working with annotations - displaying them, even allowing users to create them.

:::caution
This section needs working up and rewriting, and needs examples.
:::

DisplayAnnotation has properties and events that relate to the visual (and/or audible) canvas - selection, resize, click etc.

If you used Canvas Panel as part of an annotation creation tool, you'd be allowing the user to create new DisplayAnnotations.

When displaying existing annotations, you wrap W3C annotations with DisplayAnnotations to make them visible to the user.

If the canvas allowed it, the user could resize or reposition something on the canvas. The object through which the code does this on the canvas - position, style, state, events - is a DisplayAnnotation.

Canvas Panel manages the set of DisplayAnnotations for you. It has an ordered list of them. You can inspect this and manipulate it.

Canvas Panel knows what DisplayAnnotations are on it at any moment.

If you allowed all of the annotations that come referenced from a manifest to be wrapped and displayed then they'd all be on the canvas and accessible. The developer has access to all the actual annotations via Vault, and might want to be selective about which ones become visible on the canvas and when.

They need to become DisplayAnnotations to become visible, or become interactive.

While you can always drop down into Atlas and draw whatever you like, DisplayAnnotation is a way of drawing and managing common scenarios that usually come from annotations. Even if you synthesise an anno just to do the job - e.g., drawing a box on the canvas, #12, could be done in purely drawing/div/html terms at the Atlas level, but via a highlighting annotation, exposed by Vault as the helper Annotation class, then wrapped with a DisplayAnnotation to make it visible.

DisplayAnnotation has properties to show and hide it, you can move its stacking order (z-index) position, you can allow it to be moved by the user, you can allow it to be resized by the user...

See events introduction at https://github.com/digirati-co-uk/iiif-canvas-panel/discussions/45#discussioncomment-1164643

Vault loads canvas... sees that there's a lot of annos here. You could just pipe them all through onto the canvas to become visible as DisplayAnnotation with defaults. You could pipe them all through and call callbacks to decorate/cancel/whatever. You could query by motivation, or expose the different anno pages they are on (e.g., German captions and English captions in separate anno page links).

You don't know what's there, so how do you find out what's there and then how do you react to it.. and when - with the Vault annos, before they become displayAnnos?
Let some out onto the canvas to become visible.. as wrapped DisplayAnnotations

Many ways this could be done...

Automatically have all annos become displayAnnos known to the canvas but don't make them visible (i.e., don't make them be reflected in DOM) until you say so...
Manually manage what annos become displayAnnos by listening to data loading events and making decisions (and decorating in passing)

`cp.displayAnnotations.onPaint({ motivation: 'linking' }, () => { /* do something */ });`

Stephen - I think I’ve found a way to do events in an easy, scalable way:

```js
cp.query({
  type: "Annotation",
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
}).addEvenetListener('load', () => {
 // ...
})
```

then we can scale out with different matchers (like motivation: 'some value' ) and options, where the logic is maybe more specific


[See Annotation Library (gist)](https://gist.github.com/stephenwf/b04b60f2cef22f43cd985f5983587e37)

## Constructing DisplaAnnotations

Often constructed from a W3C annotation directly (because it's come from some IIIF).
Hyperion will turn a W3C annotation into a strongly typed helper annotation, if it can...

LinkingAnnotation
TaggingAnnotation

There might not be a lot of difference between these classes - they'll have different motivation properties, but many of them will have similar targets and many will have similar bodies.

While Target is probably the same class, bodies can be TextualBody (which can take HTML too), IIIFResourceBody (links to other IIIF resources or parts of), ResourceBody (links to other web resources like text/html pages, application/pdf document, etc).

A DisplayAnnotation can be constructed from one of these.

In the #13 linking example it's shown how the DisplayAnnotation constructor can take additional options to control handling of annotation bodies. For example if the linking annotation has a body that is part of a IIIF resource, you might want the generated hyperlink the end user clicks on to point to a viewer that loads that resource via a content state - you need a helper to transform that, CP won't know.

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

in #13 there's an example of `body.getContentState()` but a Target could have that too; there's some base class. A body might be a plain string, or a plain hyperlink.
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

* A W3C `Annotation` can't have a CSS Class, but the Canvas Panel `AnnotationDisplay` that wraps it can.
* A W3C `Annotation` can't have an href property to link to a web page, but the Canvas Panel `AnnotationDisplay` that wraps it can.

<!--Canvas Panel also defines `TransitionOptions` - a class used to define how the canvas navigates from one Annotation or state to another, e.g., for guided viewing.-->

<!-- removed sections on Target and Body classes - see /notes/14-annotations-hidden.md -->

## Loading Annotation Pages


<Sandbox stacked project={annoPages} />


## Canvas Panel's managed annotations

The example above showed that in order for an annotation to become visible, it needs to be wrapped in an AnnotationDisplay, using the helper `cp.createAnnotationDisplay(w3cAnno)`, and then added to `cp.annotations`.

AnnotationDisplays can be given event handlers, to react to the user. If the desired behaviour is to link to an external web page, you can simply give the AnnotationDisplay an `href` property, as shown in the third annotation in the above example.


Canvas Panel's `annotations` property is an AnnotationPage, just like the one loaded in the previous example. But it's a specially managed AnnotationPage, used to store the visible annotations.

A W3C Annotation might exist in vault as a reference in this AnnotationPage as well as the AnnotationPage it started out in.

The Vault doesn't know anything about the `AnnotationDisplay` class. It belongs to Canvas Panel. It provides properties that help you style annotations, react to events on them, manage their visibility on the canvas, and other utility / extensions.

> You can also reorder annotations using the vault helper `reoderEntityField`

:::info
If you want total control of what you draw on the canvas, outside of IIIF and annotations, you can step down into Atlas and access the _world_ directly. But for general annotation scenarios - including annotation creation and editing as well as tags, links, descriptions, markers, highlights... the `AnnotationDisplay` provides common functionality using a consistent Annotation model for associating content with the canvas. It can be made interactive, allowing it to be positioned and re-sized by the user. Canvas Panel is deliberately not a general-purpose drawing surface, it's for IIIF+Annotation scenarios.
:::

Available functions:

```js
cp.annotations.add(myAnno);
cp.annotations.remove(myAnno);
cp.annotations.getAll();
cp.annotations.get(id);
cp.annotations.getSource(id); // returns the original ID, not display annotation
```

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


## AnnotationDisplay details

One major role of Canvas Panel is simply rendering scenes - passing a canvas in and relying on Canvas Panel to render all the painting annotations. Occasionally that requires some user interaction - when the painting anno has a Choice body - but usually, the point of Canvas Panel is to forget about this.

The other major part of Canvas Panel is working with annotations - displaying them, even allowing users to create them.

AnnotationDisplay has properties and events that relate to the visual (and/or audible) canvas - selection, resize, click. If you used Canvas Panel as part of an annotation creation tool, you'd be allowing the user to create new `AnnotationDisplay` instances.

When displaying existing annotations (like the ones loaded above), you wrap them with a `AnnotationDisplay` to make them visible to the user. You can optionally allow the user to resize or reposition the `AnnotationDisplay` - its internal Target object would update as the user does this, as well as the visual size and position changes on the canvas surface.

Canvas Panel knows what AnnotationDisplays are on it at any moment. Canvas Panel manages the ordered list of AnnotationDisplays for you. You can inspect this list and manipulate it, for example moving AnnotationDisplays to change the visible stacking order.

If you allowed all of the annotations that come referenced from a manifest to be wrapped and displayed then they'd all be on the canvas and accessible. The developer has access to all the actual annotations via Vault, and might want to be selective about which ones become visible on the canvas and when.

<!--
  myDisplayAnno.draggable = true; // can be moved on the canvas
  myDisplayAnno.resizable = true; // Canvas Panel renders handles, allows resizing
-->

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


## More on annotation style and CSS

In previous examples, a CSS class has been applied to a AnnotationDisplay like this:

```js
displayAnno.cssClass = "red-box";
```

...where your CSS has a selector for `.red-box` that perhaps sets border and background styles.

This works as you might expect it to - the AnnotationDisplay is an HTML Element in the DOM within Canvas Panel, and the styles are applied directly by the browser.

This works simply and well for a small number of annotations, but is inefficient for scenarios involving bulk display of a very large number of annotations.

For example, you can load and display an entire annotation page at once that may contain many thousands of boxes round individual words, or highlights on a biological specimen. In these cases it is more efficient for the boxes to be drawn directly by Canvas Panel, rather than as HTML elements that can pick up styles from your own stylesheets.

These annotations can still be styled, but not by picking up your CSS directly (they are not HTML elements).

Instead, they can use a subset of styling information set in a CSS-like syntax:

This approach is explained in more detail in [Working with Annotation Pages](./annotations-in-bulk).

```js
// TODO - example of loading a whole anno page (also needed for previous section)
// Also wire up some mouse over and click handlers here.
```

It is possible to create DisplayAnnotations as before, but style them using the optimised, non-HTML technique. This way they do not become HTML elements:

```js
const displayAnno = new AnnotationDisplay(vault.FromRef("my-anno"));
displayAnno.applyStyle({
  backgroundColor: 'red',
  border: '1px solid blue',
});
```

It's the application of direct, CSS styles that makes a display annotation an HTML element; without CSS styles it can still be drawn on the Canvas, and styled with a reduced set of options.

<GitHubDiscussion ghid="33" />
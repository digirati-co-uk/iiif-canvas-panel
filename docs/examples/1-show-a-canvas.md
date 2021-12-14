---
sidebar_position: 1
---

# Render a canvas

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

The [quick start](../intro) showed the basics of rendering a canvas. The power of Canvas Panel is more apparent when you render a canvas that isn't the 99% use case - when the canvas:

 - has one image, but that image doesn't target the whole canvas.
 - has more than one image on a canvas (e.g., a digitally reconstituted manuscript)
 - has time-based media, text or other resources.

The developer experience is the same - it has to be: you probably don't know what's on the Canvas. That's the point of using Canvas Panel, to avoid having to _evaluate the scene_ and make complex rendering decisions yourself. 

Instead, Canvas Panel does the hard work. You can still _respond_ to the scene composition and what the user does with it.

Here the Canvas has several different image sources on it:

<!-- TODO: GH-71 -->
```html
<canvas-panel
   iiif-content="..multiple-content-canvas..."
   partof="..manifest..">
</canvas-panel>
```

This can still be rendered as a static image!

<!-- TODO: GH-71, GH-56 -->
```html
<canvas-panel
   render="static"
   iiif-content="..multiple-content-canvas..."
   partof="..manifest..">
</canvas-panel>
```

## Accessibility considerations

By default, Canvas Panel will render HTML5 that uses as much information from the IIIF resource as available to provide accessibility information, using the browser's current language settings to pick from alternate languages if available.

<!-- TODO: GH-91 -->
The HTML5 `alt`, `aria-label`, `aria-labelledby`, `role` and `title` attributes are available on `<canvas-panel>` and will be carried through to the DOM and from the DOM to the accessibility tree seen by assistive technologies. These attributes can be used for manual control over resulting attributes, to override the defaults that Canvas Panel decides from the IIIF content.

<!-- TODO: GH-91 -->
> Demonstrate that CP generates `aria-*` attributes for assistive technologies from the IIIF label langauage map(s), using browser settings

For a standard 2D canvas, the canvas panel on the page will assign itself `role="img"`. If the canvas carries text content could be exposed to a screen reader, Canvas Panel provides ways of doing this - see [Handling Text](./handling-text) for more on how to expose text from the canvas (e.g., transcriptions, OCR, captions) to assisitve technologies.

:::question
Should Canvas Panel, _by default_, render as a static image and only become a zoomable element on interaction? Mousewheel, click, etc. Mousewheel and pan events need to be carefully handled to avoid trapping the user in the element, especially on narrow touch devices like a phone. <!-- TODO: GH-78 -->
:::

:::info
Canvas Panel could, in future, make use of the [Accessibility Object Model](https://wicg.github.io/aom/explainer.html). It needs to be accessible _today_ in browsers that don't support that spec (no browsers support it fully, and those that support parts of it still require that it is manually enabled).
:::

<!-- TODO: GH-91 -->
```html title="Telling assistive technologies that the canvas is a decorative element"
<canvas-panel id="cp"></canvas-panel>
<script>
   const cp = document.getElementById("cp");
   const vault = HyperionVault.globalVault();
   cp.setAttribute("render", "static");
   cp.setAttribute("role", "presentation");
   cp.setAttribute("alt", "");
   await vault.loadManifest("..manifest containing canvas..");
   cp.setCanvas("..id of canvas with nice pattern on ..it");
</script>  
```

> Show it! (demonstrates manual override of accessibility defaults, potentially)

## Server-side Canvas Panel

Canvas Panel and its underlying libraries can also be used on the server, to render simple HTML representations of IIIF resources.

This is covered in [Server-side rendering](../../docs/applications/server-side).

<GitHubDiscussion ghid="1" />

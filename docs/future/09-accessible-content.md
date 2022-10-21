---
sidebar_position: 4
---

# Accessible content

By default, Canvas Panel will render HTML5 that uses as much information from the IIIF resource as available to provide accessibility information, using the browser's current language settings to pick from alternate languages if available.

<!-- TODO: GH-91 -->
The HTML5 `alt`, `aria-label`, `aria-labelledby`, `role` and `title` attributes are available on `<canvas-panel>` and will be carried through to the DOM and from the DOM to the accessibility tree seen by assistive technologies. These attributes can be used for manual control over resulting attributes, to override the defaults that Canvas Panel decides from the IIIF content.

<!-- TODO: GH-91 -->
> Demonstrate that CP generates `aria-*` attributes for assistive technologies from the IIIF label language map(s), using browser settings

For a standard 2D canvas, the canvas panel on the page will assign itself `role="img"`. If the canvas carries text content could be exposed to a screen reader, Canvas Panel provides ways of doing this - see [Handling Text](./handling-text) for more on how to expose text from the canvas (e.g., transcriptions, OCR, captions) to assisitve technologies.


:::info

Canvas Panel could, in future, make use of the [Accessibility Object Model](https://wicg.github.io/aom/explainer.html). It needs to be accessible _today_ in browsers that don't support that spec (no browsers support it fully, and those that support parts of it still require that it is manually enabled).

:::

<!-- TODO: GH-91 -->
```html title="Telling assistive technologies that the canvas is a decorative element"
<canvas-panel id="cp"></canvas-panel>
<script>
   const cp = document.getElementById("cp");
   cp.setAttribute("render", "static");
   cp.setAttribute("role", "presentation");
   cp.setAttribute("alt", "");
   await cp.vault.loadManifest("..manifest containing canvas..");
   cp.setCanvas("..id of canvas with nice pattern on ..it");
</script>  
```

> Show it! (demonstrates manual override of accessibility defaults, potentially)


## Other possible accessibility measures

Canvas Panel makes it very easy to tie different configurations to feature detection through media queries, as described in [Responsive Images](../examples/rendering-modes). On its own this doesn't make anything accessible, but sensible choices of rendering modes can assist. For example, render a static image rather than a deep zoom image if [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) is detected.

We can also use queries to determine how Canvas Panel makes requests to the IIIF Image API. This is perhaps more useful in cases where a client viewer is built for a known collection, where the capabilities of its image services are predictable. For example, queries like `forced-colors`, `inverted-colors`, `monochrome`, `orientation`, `prefers-color-scheme` and `prefers-contrast` could be used to determine what [quality](https://iiif.io/api/image/3.0/#quality) parameter is passed to the image service, including custom qualities implemented for accessibility purposes - which might not even be directly equivalent to the other qualities. This might be especially useful for digitised printed books. A high contrast mode could trigger `bitonal` requests, and a custom mode could trigger requests for images that render a synthetic view of the page using cleaned-up OCR text.

```html
<image-service src="https://iiif.wellcomecollection.org/image/b22383268_0016.jp2" />
```

<div>
<img src="https://iiif.wellcomecollection.org/image/b22383268_0016.jp2/full/500,/0/default.jpg" />
<img width="500" src="https://iiif.wellcomecollection.org/image/b22383268_0016.jp2/full/max/0/bitonal.jpg" />
</div>

Note that media queries can be used for other things beside viewport - e.g., prefers reducedMotion, high contrast
https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia


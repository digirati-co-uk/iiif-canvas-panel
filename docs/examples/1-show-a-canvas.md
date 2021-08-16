---
sidebar_position: 1
---

# Render a canvas

:::note

This page might just be reproducing the quick start... do we move the quick start here?

:::

Show a IIIF Canvas as a deep-zoom panel:

```html
<canvas-panel
   iiif-content="https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2"
   partof="https://iiif.wellcomecollection.org/presentation/b18035723">
</canvas-panel>
```

or as a static image:


```html
<canvas-panel
   render="static"
   iiif-content="https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2"
   partof="https://iiif.wellcomecollection.org/presentation/b18035723">
</canvas-panel>
```

## Accessibility considerations

:::info
Canvas Panel should make use of the [Accessibility Object Model](https://wicg.github.io/aom/explainer.html), but be accessible _today_ in browsers that don't support that spec (no browsers support it fully, and those that support parts of it still require that it is manually enabled).
:::

By default canvas panel will render HTML5 that uses as much information from the IIIF resource as available to provide accessibility information, including the browser's current language settings. 

The HTML5 `alt`, `aria-label`, `aria-labelledby`, `role` and `title` attributes are available on `<canvas-panel>` and will be carried through to the DOM and from the DOM to the accessibility tree seen by assistive technologies. These attributes can be used for manual control over resulting attributes.

For a standard 2D canvas, the canvas panel on the page will assign itself `role="img"`.

:::caution

Should Canvas Panel, _by default_, render as a static image and only become a zoomable element on interaction? Mousewheel, click, etc. Mousewheel and pan events need to be carefully handled to avoid trapping the user in the element, especially on narrow touch devices like a phone.

:::

See [Handling Text](./handling-text) for more on how to expose text from the canvas (e.g., transcriptions, OCR, captions) to assisitve technologies.

```html title="Telling assistive technologies that the canvas is a decorative element"
<canvas-panel id="cp"></canvas-panel>
<script>
   const cp = document.getElementById("cp");
   cp.setAttribute("render", "static");
   cp.setAttribute("role", "presentation");
   cp.setAttribute("alt", "");
   const vault = cp.vault;
   await vault.loadManifest("https://iiif.wellcomecollection.org/presentation/b18035723");
   cp.setCanvas("https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2");
</script>  
```


## Server-side Canvas Panel

(Explain how you'd use server side rendering)


## Complex scenes

Most IIIF canvases have one image with one image service. We'll call anything that isn't this a "complex scene".

For example:

 - one image, but doesn't target the whole canvas.
 - more than one image on the canvas (e.g., a digitally reconstituted manuscript)

:::warn

TODO - a complex scene example

first with non overlapping images
Then show the Chateauroux example

:::




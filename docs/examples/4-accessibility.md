---
sidebar_position: 4
---

# Accessibility

<!-- stephen

Not that media queries can be used for other things beside viewport - e.g., prefers reducedMotion, high contrast
https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia

https://iiif.wellcomecollection.org/image/b22383268_0016.jp2/full/max/0/bitonal.jpg

Also talk about keyboard navigation

 -->
:::info

Accessibility of IIIF resources is a really important topic. So many apparently inaccessible digital objects contain a huge amount of information that could be useful to assistive technologies - labels, other metadata, textual transcriptions and descriptions, all labelled by language.

Often publishers are aware of this but can't see a way to connect the digital object in a deep zoom viewer with the information that they have; even though the viewer is a box that assistive technologies can enter, the presentation of _useful_ information to those technologies (rather than obvious and non-helpful information) is a hard problem.

Canvas Panel has the potential to help publishers make their IIIF as accessible as possible - not just by using the content of the IIIF alone, but where necessary connecting the IIIF content to other markup on the page outside of the web component.

In the current phase of work, we have made a start. We recognise that much more can be done. Ideally, Canvas Panel is a great tool for helping publishers of IIIF make their content as accessible as possible - it does it all can for you, and gives you hooks to do more yourself.

:::

By default, Canvas Panel will render HTML5 that uses as much information from the IIIF resource as available to provide accessibility information, using the browser's current language settings to pick from alternate languages if available.

<!-- TODO: GH-91 -->
The HTML5 `alt`, `aria-label`, `aria-labelledby`, `role` and `title` attributes are available on `<canvas-panel>` and will be carried through to the DOM and from the DOM to the accessibility tree seen by assistive technologies. These attributes can be used for manual control over resulting attributes, to override the defaults that Canvas Panel decides from the IIIF content.

<!-- TODO: GH-91 -->
> Demonstrate that CP generates `aria-*` attributes for assistive technologies from the IIIF label language map(s), using browser settings

For a standard 2D canvas, the canvas panel on the page will assign itself `role="img"`. If the canvas carries text content could be exposed to a screen reader, Canvas Panel provides ways of doing this - see [Handling Text](./handling-text) for more on how to expose text from the canvas (e.g., transcriptions, OCR, captions) to assisitve technologies.

:::question
Should Canvas Panel, _by default_, render as a static image and only become a zoomable element on interaction? Mousewheel, click, etc. Mousewheel and pan events need to be carefully handled to avoid trapping the user in the element, especially on narrow touch devices like a phone. <!-- TODO: GH-78 -->
:::

^^ render=static is this already
you could easily make it render=zoom on click or other interaction

TODO - show example? Zoom on interaction demo

TODO - any other useful examples on this page


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

## Server-side Canvas Panel

Canvas Panel and its underlying libraries can also be used on the server, to render simple HTML representations of IIIF resources.

This is covered in [Server-side rendering](../../docs/applications/server-side).

<GitHubDiscussion ghid="1" />

---
sidebar_position: 4
---

# Accessibility


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


## Other possible accessibility measures

Canvas Panel makes it very easy to tie different configurations to feature detection through media queries, as described in [Responsive Images](./responsive-image). On its own this doesn't make anything accessible, but sensible choices of rendering modes can assist. For example, render a static image rather than a deep zoom image if [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) is detected.

We can also use queries to determine how Canvas Panel makes requests to the IIIF Image API. This is perhaps more useful in cases where a client viewer is built for a known collection, where the capabilities of its image services are predictable. For example, queries like `forced-colors`, `inverted-colors`, `monochrome`, `orientation`, `prefers-color-scheme` and `prefers-contrast` could be used to determine what [quality](https://iiif.io/api/image/3.0/#quality) parameter is passed to the image service, including custom qualities implemented for accessibility purposes - which might not even be directly equivalent to the other qualities. This might be especially useful for digitised printed books. A high contrast mode could trigger `bitonal` requests, and a custom mode could trigger requests for images that render a synthetic view of the page using cleaned-up OCR text.

An idea of what could be possible is shown in the following demo.

<!-- stephen

Not that media queries can be used for other things beside viewport - e.g., prefers reducedMotion, high contrast
https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia

https://iiif.wellcomecollection.org/image/b22383268_0016.jp2/full/max/0/bitonal.jpg

 -->

## Keyboard navigation

Canvas Panel can be controlled via the keyboard. Once it has focus (through standard tab order):

 - The arrow keys Move the viewport.
 - The + and - keys zoom in and out (without holding _Shift_)
 - The 0 key returns the viewport to its "home" start position. 
 
 
 <p>
    <canvas-panel
        click-to-enable-zoom="true"
        canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
        manifest-id="https://digirati-co-uk.github.io/wunder.json">
    </canvas-panel>
</p>


## Capturing user control


CP is just a web component. You can style it, add event listeners... anything you can do with a div. You can attach a click event listener to it, handle it and call CP's zoom action. A double click on Canvas Panel to zoom should be a standard browser-provided event handler on the element, followed by an API call to zoom.

The internal event system is different, e.g., clicking on an annotation within CP. But for externally facing events, we think developers should use the standard web event model.

There are many kinds of interaction that do not require CP to expose a specific event because they are just standard web events - but we'll make a few more demos for common scenarios.

## Avoiding capture

For mousewheel events, when CP has focus it will capture mousewheel events. If you click off it, then it won't capture mousewheel events and allows the user to scroll the page.

TODO: Make a demo equiv of:
 
https://deploy-preview-186--iiif-canvas-panel-demos.netlify.app/ 

We also need to demonstrate techniques for mobile/touch - both the simple viewer and reacting to the user pages need more worked examples.
```
click-to-enable-zoom="true"
```


<GitHubDiscussion ghid="1" />

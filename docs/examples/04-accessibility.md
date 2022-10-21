---
sidebar_position: 4
---

# Accessibility

<img src="https://cdn.pixabay.com/photo/2018/09/24/08/37/pixel-3699343_960_720.png" />

import zoomDemo from '@site/sandboxes/04-accessibility/user-events.csb/_load';
import moreZoom from '@site/sandboxes/04-accessibility/more-zoom.csb/_load';
import { Sandbox } from '@site/Sandbox';

This topic divides into two categories. The first is the accessibility of the user interfaces of the applications that you will build using Canvas Panel. Can people _drive_ the interface, make it do what they want, through multiple input mechanisms.

The second is the accessibility of the content that you are presenting in your applications, with Canvas Panel's help.

Canvas Panel needs to help you make your applications accessible in these two different ways.


:::info

Accessibility of IIIF resources is a really important topic. So many apparently inaccessible digital objects contain a huge amount of information that could be useful to assistive technologies - labels, other metadata, textual transcriptions and descriptions, all labelled by language.

Often publishers are aware of this but can't see a way to connect the digital object in a deep zoom viewer with the information that they have; even though the viewer is a box that assistive technologies can enter, the presentation of _useful_ information to those technologies (rather than obvious and non-helpful information) is a hard problem.

Canvas Panel has the potential to help publishers make their IIIF as accessible as possible - not just by using the content of the IIIF alone, but where necessary connecting the IIIF content to other markup on the page outside of the web component.

In the current phase of work, we have made a start. **We recognise that much more can be done.** Ideally, Canvas Panel is a great tool for helping publishers of IIIF make their content as accessible as possible - it does it all can for you, and gives you hooks to do more yourself.

:::

## Interface accessibility

### Avoiding capture

The actions a user performs to control the viewport within Canvas Panel are typically the same actions used to control the browser's viewport on the web page - mousewheel actions and swiping.

This can cause problems for a user trying to navigate the web page, when their mouse or finger enters Canvas Panel: subsequent attempts to scroll the page are captured by Canvas Panel and interpreted as zoom actions. The degree to which this is a problem depends on the page design, but is most problematic when the Canvas Panel viewport takes up most of the page width.

If Canvas Panel is not in zoom mode (i.e., not in the default mode), this problem doesn't arise as there is no viewport independent of the page.

When in zoom mode, you can require that canvas panel is activated with a click or tap before zoom is enabled. This is an appropriate setting for content taking up most of the browser width.

```html
    <canvas-panel
        click-to-enable-zoom="true"
        canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
        manifest-id="https://digirati-co-uk.github.io/wunder.json">
    </canvas-panel>
```

 <p>
    <canvas-panel
        click-to-enable-zoom="true"
        canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
        manifest-id="https://digirati-co-uk.github.io/wunder.json">
    </canvas-panel>
</p>

### Keyboard navigation

Canvas Panel can be controlled via the keyboard. Once it has focus (through standard tab order):

 - The arrow keys Move the viewport.
 - The + and - keys zoom in and out (without holding _Shift_)
 - The 0 key returns the viewport to its "home" start position. 
 
 You can try this on the previous example - use the tab order to enter or leave the canvas panel; when in focus, the keys above can be used to navigate.
 
## Capturing user actions

CP is just a web component. You can style it, add event listeners... anything you can do with a div. You can attach a click event listener to it, handle it and call CP's zoom action. A double click on Canvas Panel to zoom should be a standard browser-provided event handler on the element, followed by an API call to zoom.

<Sandbox stacked project={zoomDemo} />

The internal event system is different, e.g., clicking on an annotation within CP. But for externally facing events, we think developers should use the standard web event model.

There are many kinds of interaction that do not require CP to expose a specific event because they are just standard web events.

Should Canvas Panel, _by default_, render as a static image and only become a zoomable element on interaction? You could implement this behaviour manually:

<Sandbox stacked project={moreZoom} />


## Accessible content

See [Accessible content](../future/accessible-content) for a discussion of what could come next.


<GitHubDiscussion ghid="1" />

---
sidebar_position: 1
---

# Render a canvas

import { GitHubDiscussion } from "@site/GitHubDiscussion.js";
import renderCanvasContentState from '@site/sandboxes/01-show-canvas/canvas-content-state.csb/_load';
import renderCanvasAttributes from '@site/sandboxes/01-show-canvas/canvas-attributes.csb/_load';
import { Sandbox } from '@site/Sandbox';

The [quick start](../intro) showed the basics of rendering a canvas. The power of Canvas Panel is more apparent when you render a canvas that isn't the 99% use case - when the canvas:

 - has one image, but that image doesn't target the whole canvas.
 - has more than one image on a canvas (e.g., a digitally reconstituted manuscript)
 - has time-based media, text or other resources.

The developer experience is the same - it has to be: you probably don't know what's on the Canvas. That's the point of using Canvas Panel, to avoid having to _evaluate the scene_ and make complex rendering decisions yourself.

Instead, Canvas Panel does the hard work. You can still _respond_ to the scene composition and what the user does with it.

Here the Canvas has two different image sources on it:

```html
<canvas-panel
   canvas-id="..canvas-with-multiple-images..."
   manifest-id="..manifest-that-contains-this-canvas..">
</canvas-panel>
```

<canvas-panel
   canvas-id="https://preview.iiif.io/cookbook/3333-choice/recipe/0036-composition-from-multiple-images/canvas/p1"
   manifest-id="https://gist.githubusercontent.com/stephenwf/19e61dac5c329c77db8cf22fe0366dad/raw/04971529e364063ac88de722db786c97e2df0e6b/manifest.json">
</canvas-panel>

This can still be rendered as a static image, even though it's a composite scene!

```html
<canvas-panel
   preset="static"
   canvas-id="..multiple-content-canvas..."
   manifest-id="..manifest..">
</canvas-panel>
```

<canvas-panel
   preset="static"
   canvas-id="https://preview.iiif.io/cookbook/3333-choice/recipe/0036-composition-from-multiple-images/canvas/p1"
   manifest-id="https://gist.githubusercontent.com/stephenwf/19e61dac5c329c77db8cf22fe0366dad/raw/04971529e364063ac88de722db786c97e2df0e6b/manifest.json">
</canvas-panel>

> The default value of `preset` is "zoom" - this can be set explicitly but is not usually required. See [Responsive Images and rendering modes](responsive-image).

The other likely rendering option is `responsive` - which on its own will cause canvas panel to render the region, without a viewport:

<Sandbox project={renderCanvasContentState} />

The above example encodes the region of the canvas, and the manifest that canvas belongs to, into a content state - you can see it [decoded here](https://base64url.herokuapp.com/?iiif-content=JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRnByZXZpZXcuaWlpZi5pbyUyRmNvb2tib29rJTJGMzMzMy1jaG9pY2UlMkZyZWNpcGUlMkYwMDM2LWNvbXBvc2l0aW9uLWZyb20tbXVsdGlwbGUtaW1hZ2VzJTJGY2FudmFzJTJGcDElMjN4eXdoJTNEMzU2OSUyQzc2MSUyQzE4NTElMkMyMDU5JTIyJTJDJTIydHlwZSUyMiUzQSUyMkNhbnZhcyUyMiUyQyUyMnBhcnRPZiUyMiUzQSU1QiU3QiUyMmlkJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZnaXN0LmdpdGh1YnVzZXJjb250ZW50LmNvbSUyRnN0ZXBoZW53ZiUyRjE5ZTYxZGFjNWMzMjljNzdkYjhjZjIyZmUwMzY2ZGFkJTJGcmF3JTJGYTgxYzM3Mzk3MTFkMTQwYmQwNGJlNGYwYjQ4MDBlNDIxY2M2MTc2MSUyRm1hbmlmZXN0Lmpzb24lMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTWFuaWZlc3QlMjIlN0QlNUQlN0Q). The same result can be achieved with attributes:


<Sandbox project={renderCanvasAttributes} />

3569,761,1851,2059


## Server-side Canvas Panel

Canvas Panel and its underlying libraries can also be used on the server, to render simple HTML representations of IIIF resources.

This is covered in [Server-side rendering](../../docs/applications/server-side).

<GitHubDiscussion ghid="1" />


---
sidebar_position: 7
---

# Single Image Service

Sometimes you really do have an image service, rather than anything from the Presentation API.

There's no notion of scene composition here - it's just one image service. And it can't carry annotations - that's what a canvas is for.

But we do provide a component to render it, that has the same `static`, `responsive` and `zoom` (the default) modes as canvas-panel.

```html
<!-- This behaves like an image tag -->
<img-service src="http://..." render="static" />
```
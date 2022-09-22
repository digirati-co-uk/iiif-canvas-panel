---
sidebar_position: 23
---

# State

Canvas panel at its simplest simply renders a canvas in the way an image tag renders the pixels of an image within the block it occupies on the page. But Canvas panel in interactive mode has to do something completely different as well - render a “World”, and provide a viewport on that world, within which the canvas is rendered, at some position that is a world property rather than any intrinsic property of the canvas itself. This is where canvas panel overSlaps with a viewer; it needs to provide this kind of functionality, because the whole point of CP is to make it easy to build viewers - but it doesn't want to be too opinionated because it's not (or not supposed to be) a viewer all by itself.

The Viewport that canvas panel provides can be treated like an annotation box.
We will add a convenience helper to surface this to Canvas Panel's API.

You also need information that would allow you to activate or deactivate zoom controls. Given the current mouse position, is further zooming (whether in or out) possible at this position?

TODO

See a demonstration at [Simple viewer with common features](../applications/simple-viewer-with-common-features)

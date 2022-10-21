---
sidebar_position: 23
---

# State

Canvas panel at its simplest simply renders a canvas in the way an image tag renders the pixels of an image within the block it occupies on the page. But Canvas panel in interactive mode has to do something completely different as well - render a “World”, and provide a viewport on that world, within which the canvas is rendered, at some position that is a world property rather than any intrinsic property of the canvas itself. 

The world is constructed by Canvas Panel for you, but you can customise 2 aspects:

- [How it's rendered](./02-rendering-modes.md)
- [What the viewport is](../api-reference/json-api#zoom-status-api)


More information can be found in the [events API](../api-reference/2-events.md) and [Methods](../api-reference/1-methods.md) docs.

See a demonstration at [Simple viewer with common features](../applications/simple-viewer-with-common-features)

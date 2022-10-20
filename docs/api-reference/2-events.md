---
sidebar_position: 2
---

# Events


Canvas panel exposes the following events:

### ready

This is called when the web component is ready and the APIs are available. This does not happen when the content is loaded, you will need to use other events or load the content before.

### media

This is fired when a Video or Audio canvas is loaded into the viewer. This is not currently a strategy supported by Canvas panel.

### choice

This is fired when a choice is available or the state of a choice changes.

### canvas-change

This is fired only in `<canvas-panel />` when a canvas is changed.

### sequence-change
This is fired only in `<sequence-panel />` when a sequence is changed (one or more canvases displayed).

### sequence

This is fired when a sequence has been loaded and is available - or subsequently changes, if a range is selected for example.

### zoom-to

This is fired when the users zoom changes - either from calling a zoom method or scroll-zooming. This is not called when the user
calls the `goHome()` method or when a transition is manually created.

### go-home

This is fired when a user calls the `goHome()` method or uses the keyboard shortcut.

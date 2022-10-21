---
sidebar_position: 24
---

# Multiple Canvas layout

The recommended way of arranging multiple canvases is to treat `<canvas-panel />` and `<image-service />` like other HTML elements and position them with CSS.

The only time this is not a realistic option is when you need to have multiple, separate resources - Canvases, Image Services and possible other content - sharing the same deep zoom "World" - the same viewport. They all need to zoom together.

This is where Canvas Panel stops and other components take over.

It also represents a problem. While Canvas Panel is internally a [Preact](https://preactjs.com/) component, externally it is designed to be framework-agnostic - usable from plain Javascript, or Vue, or other frameworks. When Canvas Panel is the boundary of the viewport, the React internals can be hidden. The web component boundary (i.e., the HTML element) is also the "framework" boundary. Once you want different components to share the same world, the same viewport, it becomes significantly harder to do this without requiring a React approach.

One layout approach that stays within the bounds of Canvas Panel is to create new canvases that contain the content you want laid out. But this is not a practical approach.

We have a general purpose solution, the [Layout Container](../api-reference/layout-container) component.

This is intended to provide a viewport, in which components that would normally have their own viewports become part of the container viewport. In this space you can position Canvas Panel and Image Service components, using x and y coordinates.

We also have a component that is more powerful for IIIF use cases, the [Sequence Panel](../api-reference/sequence-panel), which does not require managing nested Canvas Panels. It's designed for ease of making 2-up viewers, as it manages the paged sequence and shows pairs of canvases together. It can be seen in the [Simple Bookreader](../applications/bookreader-viewer) demo.


:::danger

Layout Container has an issue where simple composition of elements as HTML can be unreliable.
We are looking to provide an alternative, JSON-based syntax to provide a layout-container with its contents.

:::



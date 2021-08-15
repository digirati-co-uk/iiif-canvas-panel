---
title: About Canvas Panel
---

# About Canvas Panel

## What is Canvas Panel? 

In IIIF, content - images, text, video, captions, annotations - is assembled on one or more Canvases. A Canvas is like a PowerPoint slide - the virtual space that your content and annotations are arranged on. A `<canvas-panel>` component on a web page renders one IIIF Canvas, and provides properties, events and functions to support user interaction with the content on the Canvas - in IIIF and Web Annotation terms.

Canvas Panel is not a viewer (not on its own, anyway) - it has no concept of digital objects, or IIIF Manifests and Ranges. You can quickly build viewers with it - there are some examples on this site. 

Canvas Panel is a _web component_ abstraction built to hit a sweet spot of functionality and rapid development, on top of more general purpose libraries and components for loading IIIF content, and rendering images, text and AV.

Canvas Panel is to a IIIF Canvas as OpenSeadragon or Leaflet are to the IIIF Image API.

## Where did it come from?

(history)

## How do I use it?

You can use Canvas Panel a declarative way, just as HTML tags, for simply showing a canvas. For more control, you can drive it from code, and respond to events.

It works with Vault, a library for loading and managing IIIF resources that normalises everything to IIIF Presentation 3.

Using Canvas Panel from code
The role of Vault: let it manage your resources
getting a reference to Vault; imports, vanilla JS use, typescript use etc
Driving Canvas Panel
responding to events in Canvas Panel
Building applications with Canvas Panel - patterns
Introduce the Hyperion library that sits behind everything and that you can dip into when you need
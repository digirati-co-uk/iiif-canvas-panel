---
title: About Canvas Panel
---

# About Canvas Panel

## What is Canvas Panel? 

In IIIF, content - images, text, video, captions, annotations - is assembled on one or more Canvases. A Canvas is like a PowerPoint slide - the virtual space that your content and annotations are arranged on. A `<canvas-panel>` component on a web page renders one IIIF Canvas, and provides properties, events and functions to support user interaction with the content on the Canvas - in IIIF and Web Annotation terms.

Canvas Panel is not a viewer (not on its own, anyway) - it has no concept of digital objects, or IIIF Manifests and Ranges. You can quickly build viewers with it - there are some examples on this site. 

Canvas Panel is a _web component_ abstraction built to hit a sweet spot of functionality and rapid development, on top of more general purpose libraries and components for loading IIIF content, and rendering images, text and AV.

Canvas Panel is to a IIIF Canvas as OpenSeadragon or Leaflet are to the IIIF Image API.

## Why not just use OpenSeadragon?

Most canvases have just one image, that fills the canvas, and usually that image has an associated IIIF Image service. To show this using OpenSeadragon is easy - inspect the canvas, find the one image, find its image service, and pass that to OpenSeadragon. This is not many lines of code.

But as soon as you find a Canvas that has something different, you are on your own.

What if it has a choice of images - for example, a painting photographed ast different wavelengths?

What if the canvas is composed of multiple images - placed in different regions of the coordinate space?

And what about the annotations on the Canvas? What kind of annotations are they? Is text available for the canvas - whether audio or video - that could be used for transcripts and captions?

If you are building an application that might encounter anyone's IIIF content, you don't know up front what content scenarios you might be dealing with. 

Canvas Panel aims to render any Canvas, and give you hooks to code against where that rendering involves user interaction (such as selecting from a choice of images, or handling events on annotations).

## Where did it come from?

(history)

## How do I use it?

You can use Canvas Panel a declarative way, just as HTML tags, for simply showing a canvas. For more control, you can drive it from code, and respond to events.

It works with Vault, a library for loading and managing IIIF resources that normalises everything to IIIF Presentation 3.

It has some helper components that might come in useful for application development.
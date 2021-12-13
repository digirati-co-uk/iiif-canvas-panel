---
title: About Canvas Panel
---

# About Canvas Panel

## What is Canvas Panel? 

As the [Quick start](../docs/intro) says:

> Canvas Panel is a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that renders a [IIIF Canvas](https://iiif.io/api/presentation/3.0/#53-canvas) and the annotations on it.

But what does this mean?

[IIIF](https://iiif.io/) is a set of standards for working with digital objects on the web, such as digitised books, manuscripts, artworks, movies and audio. It's typically used by galleries, libraries, archives and museums to present their collections and make them _interoperable_ - they become available to software such as viewers, annotation tools, digital exhibits and more.

The unit of distribution of IIIF is the [Manifest](https://iiif.io/api/presentation/3.0/#52-manifest) - a JSON document, that contains a sequence of one or more _Canvases_, with accompanying metadata and (sometimes) structural information. A Canvas is like a PowerPoint slide - the virtual space that content is arranged on, and a Manifest has one or more "slides" - for example, one for each page of a book.

Existing IIIF viewers know how to load a Manifest, they generate a user interface for navigating around the object, and sometimes creating new content through annotation. 

A `<canvas-panel>` component on a web page renders one IIIF Canvas, and provides properties, events and functions to support user interaction with the content on the Canvas - in IIIF and Web Annotation terms. 

Canvas Panel is not a viewer (not on its own, anyway) - it has no concept of digital objects, or IIIF Manifests and structure. But you can quickly build viewers with it - there are some examples on this site. 

Canvas Panel is a _web component_ abstraction built to hit a sweet spot of functionality and rapid development, on top of more general purpose libraries and components for loading IIIF content, and rendering images, text and AV.

Canvas Panel is to a IIIF Canvas as [OpenSeadragon](https://openseadragon.github.io/examples/tilesource-iiif/) or [Leaflet](https://training.iiif.io/intro-to-iiif/LEAFLET-IIIF.html) are to the IIIF Image API. Many viewers use one or other of those libraries to deal with tiled images.

## Why not just use OpenSeadragon?

Most canvases have just one image, that fills the canvas, and usually that image has an associated IIIF Image service. To show this using OpenSeadragon is easy - inspect the canvas, find the one image, find its image service, and pass that to OpenSeadragon. This is not many lines of code. A simple IIIF viewer that is capable of showing the vast majority of one-full-image-per-canvas IIIF content can be built without really considering the role of the Canvas as the place the content lives on.

But as soon as you find a Canvas that has something different, you are on your own.

 - What if it has a choice of images - for example, a painting photographed ast different wavelengths?
 - What if the canvas is composed of multiple images - placed in different regions of the coordinate space?
 - And what about the annotations on the Canvas? What kind of annotations are they? Is text available for the canvas - whether audio or video - that could be used for transcripts and captions?

If you are building an application that might encounter anyone's IIIF content, you don't know up front what content scenarios you might be dealing with. 

Canvas Panel aims to render any Canvas, and give you hooks to code against where that rendering involves user interaction (such as selecting from a choice of images, or handling events on annotations).

More generally, it's a component that allows you to build ad hoc and bespoke IIIF viewing experiences, by providing an abstraction at the right level - the Canvas. It could sit at the heart of a complex multi-feature viewer, but it can also sit at the heart of simple web apps comrpising just a few lines of code.

## Where did it come from?

Canvas Panel began as an [idea in a gist](https://gist.github.com/tomcrane/e03d5b0405cb23f937ef86aa8f2ae575) in 2016. A first pass at a component library to solve common use cases resulted in storytelling and exhibition tools ([old canvas panel examples](https://canvas-panel.digirati.com/#/examples), and a [Medium article about storytelling with IIIF](https://medium.com/digirati-ch/reaching-into-collections-to-tell-stories-3dc32a1772af)).

Digirati's work with the Getty Research Institute on the [Florentine Codex](https://www.getty.edu/research/scholars/digital_art_history/florentine_codex/) has given us a chance to build a realisation of Canvas Panel using the [Hyperion Framework](https://github.com/digirati-labs/hyperion) ([documentation](https://hyperion.stephen.wf/)), a set of libraries for working with IIIF.

## How do I use it?

You can use Canvas Panel a declarative way, just as HTML tags, for simply showing a canvas. For more control, you can drive it from JavaScript code, have more control of the IIIF loading process, and respond to events as the user interacts with the canvas.

It works with [Vault](../docs/components/vault), a library for loading and managing IIIF resources that normalises everything to IIIF Presentation 3.

This site shows Canvas Panel, Vault and helper components being used to solve a wide range of typical use cases for presenting and interacting with digital objects.

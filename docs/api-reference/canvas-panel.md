---
sidebar_position: 3
title: <canvas-panel />
---

# Canvas panel

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

When building a IIIF Presentation API viewer, it will be much easier to use Canvas Panel than [the img-service tag](./single-image-service). This is because you are dealing with canvases in manifests - you pass the canvas to Canvas Panel to render, rather than wrrying about its content. It might not even have an image service.


See the [quick start](../intro) to get started.
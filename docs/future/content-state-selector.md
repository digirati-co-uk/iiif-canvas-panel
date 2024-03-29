---
sidebar_position: 6
title: Content State Selector
---

# Content State Selector

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

You are writing an article and you want to select a [part of some IIIF Image](../examples/highlighting-regions) to use. You don't need to know how IIIF works. The content state selector is a widget that can be incorporated into a content creation environment (e.g., a plugin for WordPress or some other CMS). In that environment, you load some IIIF resource, navigate to the place you want, (optionally) select a region, and capture the content state. 

Most of this tool is a viewer here we extend the viewer we made in [Simple Viewer](../applications/simple-viewer), adding selection capability and having it work in a modal popup.

## How it works

:::caution

Demonstrate how Canvas Panel and vault has the API that allows this component to be built.
This is waiting on the imperative content state selection mode (see [reacting to the user](../examples/reacting-to-the-user)).

:::

We'll limit it to capturing canvases, or rectangular regions of canvases, within a manifest. No ranges, no duration, etc.
Also no searching for the manifest - you need to know the URL. Leave it for others to extend.


<GitHubDiscussion ghid="18" />

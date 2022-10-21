---
sidebar_position: 2
title: Book Reader
---

# A Bookreader viewer, with facing pages

import CodeBlock from '@theme/CodeBlock';
import { GitHubIssue } from "../../GitHubDiscussion.js";
import source from '!!raw-loader!../../static/demos/bookreader.html';

This example builds on the minimal viewer by adding support for 2-up views - facing pages.

One way of doing that would be to use two Canvas Panel instances, next to each other. But the expected behaviour of a 2-up viewer is that there is still only one viewport, the two canvases live in the same "zoom-space".

A generalised way of _hoisting_ the viewport is to use `<layout-container/>`. This demo uses [Sequence panel](../api-reference/sequence-panel.md) which has some extra features to deal with paged sequences.

You can see it running at /demos/bookreader.html <a href="/demos/bookreader.html" target="_blank">Bookreader 2-up viewer</a>.

<CodeBlock
  language="html"
  title="Bookreader 2-up viewer"
  showLineNumbers>
    {source}
</CodeBlock>


<GitHubIssue ghid="64" />

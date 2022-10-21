---
sidebar_position: 3
---

# Text-centric viewer

import CodeBlock from '@theme/CodeBlock';
import { GitHubDiscussion } from "../../GitHubDiscussion.js";
import source from '!!raw-loader!../../static/demos/text-viewer-simple.html';

## Simple version

The simple version of a text centric viewer is just the simplest viewer but with the ability to select text:

<CodeBlock
  language="html"
  title="Simple viewer"
  metastring="{30-32}"
  showLineNumbers>
    {source}
</CodeBlock>

## More complex text-enabled viewer

:::danger

This example requires the features described in [text examples](../../docs/future/handling-text).

:::

This viewer extends [Simple Viewer](./simple-viewer) to add support for:

* Text selection on the Canvas
* Text display alongside the Canvas

...building on the [text examples](../../docs/future/handling-text).

It also demonstrates how Canvas Panel can be used to make any text in IIIF resources accessible to assistive technologies.

<GitHubDiscussion ghid="20" />

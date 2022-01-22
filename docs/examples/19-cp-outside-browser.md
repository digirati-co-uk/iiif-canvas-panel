---
sidebar_position: 17
---

# Canvas Panel outside the browser

Discussion of using CP on the server.

:::caution

It's not mentioned in the docs, but maybe worth a paragraph. If you're outside of a browser environment class names won't work, but applyStyles() will. It would be fairly trivial to add a node-helper around canvas panel:
import { create } from 'canvas-panel/server';

```
const canvas = create({ iiifContent: '...', region: '1000,1000,2400,2400', highlight: '..'});
canvas.toHTML(); // vanilla static divs + img tags
canvas.toPNG(); // static image - could be cached and saved
```
:::

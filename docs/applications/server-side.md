---
sidebar_position: 4
---

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

# Server-side rendering

Canvas Panel rendering mostly requires a DOM to exist and is not tailored to rendering on the server. However a server-side renderer could be made and used quickly to render out static HTML img tags or similar without the need for Javascript. This would be useful for SEO and also for showing something to the user before the whole page has loaded.

Renderers are very simple. The static renderer (creates markup) can be found here: https://github.com/atlas-viewer/atlas/blob/master/src/modules/static-renderer/static-renderer.ts

A server renderer would not need to render multiple frames, instead just an initial frame. It could look something like this:

```js
class MyRenderer {

    // ...

    paint(paint, index, x, y, width, height) {
      const image = document.createElement('img');
      image.src = paint.uri;
      image.style.position = 'absolute';

      const scale = width / paint.display.width;

      // the x, y, width and heights can be translated to transforms.
      image.style.width = `${paint.display.width + 0.8}px`;
      image.style.height = `${paint.display.height + 0.8}px`;
      image.style.display = 'block';
      image.style.top = `${Math.floor(y)}px`;
      image.style.left = `${Math.floor(x)}px`;
      image.style.transform = `scale(${scale * 1.001})`;
      image.style.transformOrigin = `0px 0px`;

      this.container.appendChild(paint.image);
    }
}
```

With the DOM API swapped out for building up static markup and/or CSS to be placed on a page. This could also be used to construct a request to ImageMagick to generate a complex thumbnails.


<GitHubDiscussion ghid="44" />
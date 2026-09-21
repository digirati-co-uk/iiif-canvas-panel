---
sidebar_position: 11
---

# Working with React

import { Example } from '@site/Example';

Import the browser bundle once in your client entry, then render custom elements with their hyphenated HTML attributes.
Use a ref for imperative methods and `addEventListener` for Canvas Panel's custom events. Remove listeners on unmount.

```jsx
import { useEffect, useRef } from "react";
import "@digirati/canvas-panel-web-components/dist/index.iife.js";
import "@digirati/canvas-panel-web-components/dist/index.css";

export function Canvas({ manifestId, canvasId, onChoice }) {
  const panel = useRef(null);
  useEffect(() => {
    const element = panel.current;
    const listener = (event) => onChoice?.(event.detail.choice);
    element.addEventListener("choice", listener);
    return () => element.removeEventListener("choice", listener);
  }, [onChoice]);
  return <canvas-panel ref={panel} manifest-id={manifestId} canvas-id={canvasId} />;
}
```

For server rendering, load the browser bundle only on the client. This v2 checkpoint uses an isolated browser runtime;
sharing your app's React instance through the ESM entry is part of the upcoming renderer migration.

The example below switches painting choices and changes their opacity:

<Example id="react-choices-example" />

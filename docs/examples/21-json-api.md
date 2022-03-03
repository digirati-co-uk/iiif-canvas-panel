---
sidebar_position: 21
---

import presetSandbox from '@site/sandboxes/custom-preset.csb/_load';
import { Sandbox } from '@site/Sandbox';

# Canvas Panel and Image Service attributes

 - list the available attrs
 - show how to use them as attrs and via the "JSON API":

 TODO - discuss how to set CP from JSON blocks


## Properties common to Canvas Panel and Image Service

### width

### height

### region

### atlas-mode

### preferred-formats

### style-id

### debug

### preset

### responsive

### interactive

### class


## Properties only on Image Service

### src



## Properties only on Canvas Panel

### manifest-id

### canvas-id

### follow-annotations

### target

### highlight

### highlight-css-class

### text-selection-enabled

### text-enabled

### iiif-content

### choice-id

### exact-initial-image

    

## Setting canvas panel via JSON

All canvas panel properties are exposed as their equivalent camelCase versions in JSON.

So `exact-initial-image` becomes `exactInitialImage`.

As well as supplying properties to canvas panel via attributes and via script, like this...

```html
<canvas-panel id="cp" height="200" />
<script>
    const cp = document.getElementById("cp");
    cp.width = 400;
</script>
```

...you can also supply properties by referencing JSON. Suppose you have the following block of JSON: 

```json 
// hosted at example.org/preset.json
{
  "styleId": "css",
  "manifestId": "http://example.org/manifest-1.json",
  "canvasId": "http://example.org/manifest-1/c1",
  "height": 300,
  "media": {
    "(min-width: 800px)": { 
      "height": 500,
      "manifestId": "http://example.org/manifest-2.json",
      "canvasId": "http://example.org/manifest-2/c1",
      "styleId": "css-tablet"
    },
    "(min-width: 1200px)": {
      "height": 700
    }
  }
}
```

You can supply these properties to canvas panel:

```html
<canvas-panel preset="https://example.org/preset.json" />
```

You can also do this directly on the page in a script block. This may be a more typical approach:

<Sandbox project={presetSandbox} />

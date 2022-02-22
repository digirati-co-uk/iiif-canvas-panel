---
sidebar_position: 2
---

# Canvas Panel and Image Service attributes

 - list the available attrs
 - show how to use them as attrs and via the "JSON API":

 TODO - discuss how to set CP from JSON blocks


## Canvas Panel Attributes

 - manifest-id
 - canvas-id
 - width
 - height
 - follow-annotations
 - target
 - region
 - highlight
 - highlight-css-class
 - text-selection-enabled
 - text-enabled
 - preferred-formats
 - atlas-mode
 - style-id
 - debug
 - preset
 - responsive
 - interactive
 - iiif-content
 - class
 - choice-id
    

## Setting canvas panel via JSON

This is a preset

Also image service tag example

TODO - need a working preset example


```json
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


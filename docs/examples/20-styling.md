---
sidebar_position: 20
---

# Styling inside Canvas Panel

TODO

Although other pages show how things get styled in passing, this page summarises the approach and brings some examples together in one place.


```javascript
cp.applyStyles(
  'https://iiif.io/api/image/3.0/example/reference/421e65be2ce95439b3ad6ef1f2ab87a9-dee-xray/full/max/0/default.jpg', {
    opacity: 0.5,
});
```


Does this one work?

```html
<canvas-panel 
  iiif-content="http://example.org/canvas-1.json" 
  choice-id="http://example.org/choice-set-a/3, http://example.org/choice-set-b/7#opacity=0.5" 
/>                                                       Useful for static rendering -----^
```

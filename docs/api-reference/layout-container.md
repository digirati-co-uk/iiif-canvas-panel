---
title: <layout-container />
---

# Layout container

A common requirement when building a more complex viewer application is to show multiple canvases, or images, at the same time.

 - rendering thumbnails
 - rendering a 2-up view
 
 In many scenarios this is not a canvas panel concern - as a web component, you can simply position multiple instances of `<canvas-panel />` or `<image-service />` using CSS. They are HTML elements on the page. Most thumbnail rendering UIs are better off using the thumbnail service of a Canvas either directly as the `src` attribute of an `<img />` tag (picking an appropriate size) or more conveniently as the `src` attribute of an `<image-service />` component. These could be laid out with Flexbox or other CSS mechanisms. You could also arrange `<canvas-panel />` components this way, using the `static` preset.
 
 
 Sharing a viewport

```html
<layout-container width="800" preset="zoom">
    <image-service nested src="https://iiif.wellcomecollection.org/image/b18035723_0010.JP2" x="0" /> 
    <image-service nested src="https://iiif.wellcomecollection.org/image/b18035723_0011.JP2" x="2411" />
</layout-container>
```

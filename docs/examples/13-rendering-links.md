---
sidebar_position: 13
---

# Rendering links

import { GitHubDiscussion } from "../../GitHubDiscussion.js";


In any canvas rendering scenario, if the canvas has linking annotations available, render them as hyperlinks on the image surface.

```js title="An example linking annotation"
{
    "id": "http://example.org/anno-l",
    "type": "Annotation",
    "motivation": ["linking"],
    "body": "https://en.wikipedia.org/wiki/The_Medallion",
    "target": {
        "id": "https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/-1#xywh=10000,10000,2000,2000",
        "type": "Canvas",
        "partOf": [
            {
                "id": "https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest",
                "type": "Manifest"
            }
        ]
    }
}
```

Note that the `target` of the anno is not the "target" of the link. The annotation `target` is the relevant part of the canvas, and the `body` of the anno is used to generate the appropriate href. Here it's just a link but it could be an object:

```js title="Alternate representation of body"
{
    "id": "https://en.wikipedia.org/wiki/The_Medallion",
    "type": "Text",
    "format": "text/html"
}
```

There are different scenarios here.

## Adding links to the Canvas

One is similar to explicit highlighting, as [Drawing boxes](./drawing-boxes) - the only difference being that the target on the canvas is a clickable link. 

Here we are adding a linking annotation to the canvas:

```html
<canvas-panel id="cp"></canvas-panel>
<script>
   const cp = document.getElementById("cp");
   const vault = .. // where do we get the shared vault from in this scenario?
   await vault.loadManifest("..manifest_id..");
   cp.setCanvas("..canvas_id..");

  // this will be the clickable shape
  // we don't need to specify the canvas that this shape is on, we're going to add it to cp in a moment.
  // cp <=> canvas so it can only target cp's current canvas.
  const linkBox = new Target("xywh=2000,2000,1000,1000");
 ​
  ​// create an annotation with motivation "linking"
  ​const anno = new LinkingAnnotation();
  ​anno.target = linkBox;

  // we'll come back to what this might be later
  anno.body = "https://artgallery.yale.edu/collections/objects/34001"; 
 
  ​// create anno in vault
  ​vault.load("my-anno", anno);

  // TODO - still think of a better name than DisplayAnnotation - 
  // it's a visual and sometimes interactive _thing_ on the canvas.
  // compare this with #12 - we're constructing our DisplayAnnotation
  ​const displayAnno = new DisplayAnnotation(vault.FromRef("my-anno"));
  ​displayAnno.cssClass = "link-shape";
      ​
  ​cp.displayAnnotations.add(displayAnno);
  
</script> 
```

By default here, because the body of the anno is a bare link, Canvas Panel can turn this into a hyperlink.

But what if the body is a canvas within a manifest? Even if CP recognises that, it doesn't know what you want to do with it as a link - e.g., turn it into a link to some other viewer with a content state on the query string.

How about you can provide a function to process the body?

```js title="stepping in to generate the link"
// cp will call this. The Body class is like Target - it's not a raw W3C anno body, 
// it's a wrapper with helpers.
function getLinkFromBody(body) {
    const cs = body.toContentState();
    if(cs) {
       return "https://example.org/viewer?iiif-content=" + cs.getEncoded();
    }
    return body.toUrl(); // TBC...
}

// this will be a linking anno...
const options = {
   linkFromBody: getLinkFromBody,
   linkCssClass: "link-shape"
}
​const displayAnno = new DisplayAnnotation(vault.FromRef("my-anno"), options);

```

## Dealing with existing linking annotations

The second scenario is where the annotations are already present in the IIIF resource, or linked from it via the canvas `annotations` property.

Canvas panel's default behaviour is (via vault) to follow `annotations`. So it has raw W3C annos available. Then we need to handle them. (Does CP have them? What does that mean - that they are loaded into the vault? They aren't drawn yet).

It can do this the same way manually added links, highlights etc are done, with DisplayAnnotation, but that needs some assistance and control.

Do we ever just allow it to attempt to display all the annotations?

The painting annos, inline in the canvas (usually, but might require a dereference of the annotation page), should always be displayed. They are the visible (and/or audible) content of the canvas.

Other annotations are linked via the `annotations` property.

If they have the motivation `supplementing`, they will be fed down a different path. They are possibly transcriptions, OCR text, captions, etc. Handle this somewhere else. See #15 

All other annotations could just be each wrapped with DisplayAnnotation instances and cp would attempt to draw them

```html
<!-- prevent default follow behaviour -->
<canvas-panel id="cp" follow-annotations="false" />


<!-- allow cp default behaviour in anno rendering, but at least provide some styles -->
<canvas-panel id="cp"
    highlight-css-class="anno-hilite"
    link-css-class="anno-link"    
/>
```


<GitHubDiscussion ghid="13" />
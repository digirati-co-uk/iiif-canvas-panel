---
sidebar_position: 5
title: Vault
---

# Vault

import { GitHubDiscussion } from "../../GitHubDiscussion.js";


Vault is the library used by Canvas Panel to load, normalise and track IIIF resources. If using Canvas Panel solely as a tag, controlling its behaviour by setting attributes, you don't need to interact with Vault. But if you are bringing IIIF to Canvas Panel via script, you use Vault.

Any IIIF resource loaded into Vault is then available _through_ Vault as _normalised_, 100% compliant IIIF Presentation API 3.0, even if it started out as IIIF Presentation 2.0. This process of normalisation gives you a consistent programming interface, without having to worry about the various forms that the JSON-LD can take in Presentation 2.0. It also allows you to develop event driven applications, because you can associate event listeners directly with IIIF resources managed and tracked in Vault. You can also _subscribe_ to changes in the data, simplifying the programming model 

This documentation site is full of examples showing Vault usage alongside Canvas Panel. But it helps to begin by showing how Vault is used for general IIIF purposes, before introducing its use with Canvas Panel.

## Installation

If you have Canvas Panel available on your page, you already have Vault, too. See the installation instructions for the full details - they also tell you how to use Vault on its own, as in the following example of loading it from a CDN. For the discussion that follows we will use this HTML page, which won't need any building or file serving.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Vault Example</title>
    <style>
        .container { display: grid; grid-template-columns: auto auto; }
        img { padding: 0.3em; }
    </style>
  </head>
  <body>
    <div class="container">
        <div id="app"></div>
        <pre id="data"></pre>  
    </div>    
    <script src="https://cdn.jsdelivr.net/npm/@hyperion-framework/vault@1.1.0/dist/index.umd.js"></script>
    <script>

        const exampleManifestUri = "https://iiif.wellcomecollection.org/presentation/b1932795x";
        const vault = new HyperionVault.Vault();

        // a couple of helpers for displaying what we find
        function showJSON(obj){
            document.getElementById("data").innerHTML = JSON.stringify(obj, null, 2);
        }
        function append(element){
            document.getElementById("app").appendChild(element);
        }
        
        async function demo(){
            // the script snippets in the following examples are added here
        }

        demo();
    </script>
  </body>
</html>
```

## Working with IIIF

The first thing to do is load some IIIF. At the start of this walkthrough we will use [this manifest](https://iiif.wellcomecollection.org/presentation/b1932795x):

```js
const exampleManifestUri = "https://iiif.wellcomecollection.org/presentation/b1932795x";
```

Vault's loadManifest() function returns a Promise:

```js
vault.loadManifest(exampleManifestUri).then(async (manifest) => {
    // work with the manifest
}
```

So we can use it in our demo page like this, slotting into `async function demo(){..}` above.

```js
const manifest = await vault.loadManifest(exampleManifestUri);
show(manifest);
```

At first glance this appears to have just printed out the manifest. But looking closer, the JSON isn't the same.

* All the properties in the Presentation 3.0 API have been filled out, with default `null` or `[]` values, even if the manifest didn't provide them. Normalisation to IIIF Presentation 3.0 means that, even when we load Presentation 2.x resources, we don't have to worry about whether they are objects or arrays. Vault's further normalisation means the we don't have to test array properties for null, they will always be there, but may have no members.
* Child resources in the graph, such as the canvases in manifest.items, only have `id` and `type` properties: they are _references_.

```json
"items": [
  {
    "id": "https://iiif.wellcomecollection.org/presentation/b1932795x/canvases/b1932795x_ms_7974_0001.JP2",
    "type": "Canvas"
  },
  {
    "id": "https://iiif.wellcomecollection.org/presentation/b1932795x/canvases/b1932795x_ms_7974_0002.JP2",
    "type": "Canvas"
  },
  //...
```

Vault has flattened and normalised the manifest; we can obtain the full (but still _normalised_) canvas from its `id` like this:

```js
const canvas0 = vault.fromRef(manifest.items[0]);
showJSON(canvas0);
```

Now we can see the canvas JSON, and also see that its child properties (like `thumbnail`) are also _references_.

We can also construct a reference manually:

```js
const canvas0a = vault.fromRef({id: "https://iiif.wellcomecollection.org/presentation/b1932795x/canvases/b1932795x_ms_7974_0001.JP2", type: "Canvas"});
showJSON(canvas0a);
console.log(canvas0 === canvas0a); // true ... they are the same object from the vault.
```

And there is a shorter form to simplify this:

```js
// TODO this overload doesn't work yet - and might be called .fromId(..)
const canvas0b = vault.fromRef("https://iiif.wellcomecollection.org/presentation/b1932795x/canvases/b1932795x_ms_7974_0001.JP2");
showJSON(canvas0b);
console.log(canvas0 === canvas0b); // true ... they are all the same object from the vault.
```

For resources like canvases, you will often want _all_ of them as the full object. The `allFromRef` function does this for you:

```js
const allCanvases = vault.allFromRef(manifest.items);
showJSON(allCanvases[0]);
```

This `fromRef` function gives us access to any resource in the Manifest:

```js
const logo = vault.fromRef(manifest.provider[0].logo[0]); // A logo for the manifest publisher
const img = document.createElement("img");
img.src = logo.id;
append(img);
```

(a real application would check that these resources exist if dealing with an unkown manifest!)

## Additional helpers

A more practical example shows the benefit of having Vault manage the IIIF:

```js
for (const canvas of manifest.items) {
    const thumb = await vault.getThumbnail(canvas, {maxWidth:200, maxHeight:200})
    showJSON(thumb); // (we'll only see the last one)
    const img = document.createElement("img");
    img.src = thumb.best.id; // .best is an Image resource
    append(img);
}
```

Vault's `getThumbnail` is a helper function that will attempt to find the best thumbnail for a resource. In this example, we want to constrain our thumbnails to 200 by 200. Vault will pick the most efficient thumbnail to use. See the [Vault Documentation](https://hyperion.stephen.wf/the-vault/vault-api/) for more details. (TODO - link to thumbnail documenation specifically).


## Following links to further resources

For this section we'll introduce a new manifest, that contains links to annotations from each canvas.

```js
const manifestWithAnnotations = await vault.loadManifest("https://iiif.wellcomecollection.org/presentation/b18106158");
const canvas10 = vault.fromRef(manifestWithAnnotations.items[10]);
showJSON(canvas10);
```

In vault's view of this canvas, `items` is a reference, but `annotations` is not. It's not a reference to something we can get in full from the Vault.

```json
  "items": [
    {
      "id": "https://iiif.wellcomecollection.org/presentation/b18106158/canvases/B18106158_0011.jp2/painting",
      "type": "AnnotationPage"
    }
  ],
  "annotations": [
    {
      "id": "https://iiif.wellcomecollection.org/annotations/v3/b18106158/B18106158_0011.jp2/line",
      "type": "AnnotationPage",
      "label": {
        "en": [
          "Text of page 11"
        ]
      }
    }
  ],
```

> How can we tell this? If it didn't have a label it would look the same as a ref. 

A user interface might display the labels of any annotation lists here, and offer the user the ability to load them.

```js
// we can safely do things like this without checking to see if canvas10.annotations is null,
// because Vault normalises array properties to empty arrays.
for(const annolist of canvas10.annotations)
{
    console.log(annolist.label.en[0]); // come back to this, we're making an assumption here
    console.log(vault.getSingleLabel(annolist, "en", "\n")); // possible alternative
}
```

As a resource external to the manifest, we load annotations specifically:

```js
const annoList = await vault.load(canvas10.annotations[0].id);
showJSON(annoList);
```

These particular annotations are lines of text, so we are more likely to want access to them all directly:

```js
const lines = vault.allFromRef(annoList.items);
let pageText = "";
for(const line of lines){
    const lineBody = vault.fromRef(line.body[0]);
    pageText += lineBody.value;
    pageText += "\n";
}
document.getElementById("data").innerHTML = pageText;
```

When using Canvas Panel, you will more likely make use of Canvas Panel's API to [work with annotations](../../docs/examples/annotations) on the Canvas. And for annotation scenarios that involve multiple text fragments, such as the lines of text here or captions on a video, Canvas Panel has a companion component called [text-lines](../docs/examples/handling-text), that will bind to these annotations and render them.


:::info

You can add your own data to Vault. You could even load IIIF by other means, and then pass it into Vault. This ensures they are normalised and _tracked_.

```js
vault.load('id', { ..json });
```

> What if my json has a conflicting id?

Vault merges the object graph, so if you had a canvas with:

```json
{"id": "http://example.org/annotation-page-1", "type": "AnnotationPage"}
```

And then loaded it in and called:

```js
vault.load('http://example.org/annotation-page-1', { full json });
```

It would merge in the fully resolved - and the graph can continue from the canvas.

:::

> TODO - how far to go with documenting Vault? More of [Vault 101](https://github.com/digirati-co-uk/iiif-canvas-panel/discussions/101)? Or link to separate Vault docs?
---
sidebar_position: 5
title: Vault
---

# Vault

import { GitHubDiscussion } from "../../GitHubDiscussion.js";


Vault is the library used by Canvas Panel to load, normalise and track IIIF resources. If using Canvas Panel solely as a tag, controlling its behaviour by setting attributes, you don't need to interact with Vault. But if you are bringing IIIF to Canvas Panel via script, you use Vault to manage IIIF resources.

Any IIIF resource loaded into Vault is then available _through_ Vault as _normalised_, 100% compliant IIIF Presentation API 3.0, even if it started out as IIIF Presentation 2.0, or 2.1. This process of normalisation gives you a consistent programming interface, without having to worry about the various forms that the JSON-LD can take before version 3 of the Presentation API. It also allows you to develop event-driven applications, because you can associate event listeners directly with the IIIF resources managed and tracked in Vault. You can also _subscribe_ to changes in the data in Vault, reacting to changes in the resources managed by Vault.

This documentation site is full of examples showing Vault usage alongside Canvas Panel. But it helps to begin by showing how Vault is used for general IIIF purposes, before introducing its use with Canvas Panel.

## Installation

If you have Canvas Panel available on your page, you already have Vault, too. But you can use it on its own, without Canvas Panel. See the [installation instructions](../../docs/components/installation) for the full details. In the following example, Vault is loaded from a CDN, avoiding any need to build or run a server.

The next few examples use this HTML page to help make the demonstration visible.

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

        let manifestUri = "https://iiif.wellcomecollection.org/presentation/b1932795x";
        const vault = new HyperionVault.Vault();

        // a couple of helpers for displaying what we find
        function show(obj, label){
            const data = document.getElementById("data");
            const sep = "\n\n\n" + (label || "") + " ==========================================\n\n"
            data.innerHTML = sep + JSON.stringify(obj, null, 2) + data.innerHTML;
        }
        function append(element){
            document.getElementById("app").appendChild(element);
        }
        
        async function demo(){
            // ##################################################################
            // the script snippets in the following examples should be added here
            // ##################################################################
        }

        demo();
    </script>
  </body>
</html>
```

## Working with IIIF

The first thing to do is load some IIIF. At the start of this walkthrough we will use [this manifest](https://iiif.wellcomecollection.org/presentation/b1932795x):

```js
let manifestUri = "https://iiif.wellcomecollection.org/presentation/b1932795x";
```

Vault's loadManifest() function returns a Promise:

```js
vault.loadManifest(manifestUri).then(async (manifest) => {
    // work with the manifest
}
```

So we can use it in our demo page like this, slotting into `async function demo(){..}` above.

```js
const manifest = await vault.loadManifest(manifestUri);
show(manifest, "Vault loads a manifest from a URI");
```

At first glance, this appears to have just printed out the manifest. But looking closer, the JSON isn't the same.

* All the properties in the Presentation 3.0 API have been filled out, with default `null` or `[]` values, even if the manifest didn't provide them. Normalisation to IIIF Presentation 3.0 means that, even when we load Presentation 2.x resources, we don't have to worry about whether they are objects or arrays. Vault's further normalisation means the we don't have to test array properties for null, they will always be there, but may have no members. Anything that could be an array, will be an array, even if it's empty.
* Child resources in the graph, such as the canvases in `manifest.items`, only have `id` and `type` properties: they are _references_.

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
show(canvas0, "The canvas, using fromRef");
```

Now we can see the canvas JSON, and also see that its child properties (like `thumbnail`) are also _references_.

We can also construct a reference manually:

```js
const myRef = {
  id: "https://iiif.wellcomecollection.org/presentation/b1932795x/canvases/b1932795x_ms_7974_0001.JP2",
  type: "Canvas"
}
const canvas0a = vault.fromRef(myRef);
show(canvas0a, "Constructing a reference manually");
console.log(canvas0 === canvas0a); // true ... they are the same object from the vault.
```

And there is a shorter form to simplify this:

```js
// TODO this overload doesn't work yet - and might be called .fromId(..)
const canvas0b = vault.fromRef("https://iiif.wellcomecollection.org/presentation/b1932795x/canvases/b1932795x_ms_7974_0001.JP2");
show(canvas0b, "And resolving the object just from its string id");
console.log(canvas0 === canvas0b); // true ... they are all the same object from the vault.
```

For resources like canvases, you will often want to do something with _all_ of them. The `allFromRef` function does this for you:

```js
const allCanvases = vault.allFromRef(manifest.items);
show(allCanvases[0], "The first of allCanvases - all obtained in one operation");
```

This `fromRef` function gives us access to any resource in the Manifest:

```js
const logo = vault.fromRef(manifest.provider[0].logo[0]); // A logo for the manifest publisher
const img = document.createElement("img");
img.src = logo.id;
append(img);
```

(a real application would check that these resources exist if dealing with an unknown manifest!)

## Additional helpers

A more practical example shows the benefit of having Vault manage the IIIF:

```js
for (const canvas of manifest.items) {
    const thumb = await vault.getThumbnail(canvas, {maxWidth:200, maxHeight:200})
    show(thumb, "This is what the thumbnail helper returns"); // (we'll only see the last one)
    const img = document.createElement("img");
    img.src = thumb.best.id; // .best is an Image resource
    append(img);
}
```

Vault's `getThumbnail` is a helper function that will attempt to find the best thumbnail for a resource. In this example, we want to constrain our thumbnails to 200 by 200. Vault will pick the most efficient thumbnail to use. See the [Vault Documentation](https://hyperion.stephen.wf/the-vault/vault-api/) for more details. (TODO - link to thumbnail documenation specifically).


## Following links to further resources

For this section we'll introduce a new manifest, that contains links to external annotation pages from each canvas. In this case, the text transcription.

```js
const manifestWithAnnotations = await vault.loadManifest("https://iiif.wellcomecollection.org/presentation/b18106158");
const canvas10 = vault.fromRef(manifestWithAnnotations.items[10]);
show(canvas10);
```

:::info

`vault.load(..)` or `vault.loadManifest(..)`?

Explain how these differ, when you can use the string id and when you can use the { id, type } reference form.

:::

In vault's view of this canvas, `items` is a reference, but `annotations` is not. It's not a reference to something we can get in full from the Vault at the moment, because vault does not have it loaded.

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

> TODO - Vault needs to include labels on references to optimise this kind of linking.

At this point we'll introduce an extra helper function for the demo. While it's easy to get the `label` property, it's not always easy to use it because it is a Language Map, rather than a string. This function gives us a string that we can display to the user:

```js
// TODO: similar functionality should be part of Vault - needs to check for {} as label, and values length > 0

// Extract a string from a language map label property of `entity` in an appropriate language.
// If there is more than one value, use `separator` to join then into a single string.
// This will fall back to the "none" language, and then to any language.
function getLabel(entity, separator, lang){
    if(!entity.label) return "";
    if(!lang){
        if(navigator && navigator.language){
            lang = navigator.language.substring(0,2);
        } else {
            lang = "none";
        }               
    }
    if(!separator) separator = "\n";
    if(entity.label[lang]) return entity.label[lang].join(separator); // joined strings in desired lang
    if(entity.label["none"]) return entity.label["none"].join(separator); // joined strings in "none" lang
    return Object.values(entity.label)[0].join(separator) || ""; // joined strings in any lang
}
```

From now on in these examples we can use `getLabel(..)`:

```js
// we can safely do things like this without checking to see if canvas10.annotations is null,
// because Vault normalises array properties to empty arrays.
for(const annolist of canvas10.annotations)
{
    console.log(getLabel(annoList)); 
}
```

As a resource external to the manifest, we load annotations specifically, from their id:

```js
const annoList = await vault.load(canvas10.annotations[0].id);
show(annoList, "The referenced annotation list");
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
show({ pageText: pageText }, "The full text of the page");
```

When using Canvas Panel, you will more likely make use of Canvas Panel's API to [work with annotations](../../docs/examples/annotations) on the Canvas. And for annotation scenarios that involve multiple text fragments, such as the lines of text here or captions on a video, Canvas Panel has a companion component called [text-lines](../../docs/examples/handling-text), that will bind to these annotations and render them.



:::info

> What if my json has a conflicting id?

Vault merges the object graph, so if you had a canvas with:

```json
{"id": "http://example.org/annotation-page-1", "type": "AnnotationPage"}
```

And then loaded that data into Vault, and then constructed your own additional annotations in-memory (e.g., in an app), 
and then called this:

```js
vault.load('http://example.org/annotation-page-1', myInMemoryAnnotations);
```

...Vault would _merge_ the annotations in myInMemoryAnnotations into the existing `AnnotationPage` object with that `id`.

:::

## More Vault features - Metadata

At this stage the `demo()` function is getting a little cluttered. Keeping the rest of the page intact, remove the contents of the demo function and start again with this:

```js
async function demo(){  
    // ##################################################################
    // the script snippets in the following examples should be added here
    // ##################################################################

    let manifestUri = "https://iiif.wellcomecollection.org/presentation/b18106158";
    const manifest = await vault.loadManifest(manifestUri);
}
```

Beyond storing the IIIF Model, Vault's additional functionality is built on the ability to store arbitrary application metadata alongside the IIIF entities.
Usually this happens under the hood, behind other API calls, but you can also build on this feature yourself:

```js
// store some arbitrary information in the vault for this manifest
vault.setMetaValue([manifest.id, 'MyCustomStorage', 'myKey'], 'myValue');
// "MyCustomStorage" provides a scope, into which you can put keys and values.

// now retrieve this data from the Vault:
let resourceMeta = vault.getResourceMeta(manifest.id);
show(resourceMeta, "stored custom metadata");
```

Having stored this data, we can now _subscribe_ to changes in it, via Vault's `subscribe` function - `function subscribe(selector, subscription)`, where `selector` is a function in which you return the particular slice of Vault you want to subscribe to, and `subscription` is a function that Vault will call when that slice changes. 

Vault calls your suscription callback with two arguments: `(selection, vault)`, where `selection` is the part of the state you subscribed to, and `vault` is a ref to Vault itself, 
so you can handle this callback without an existing reference to vault (e.g., in another library or external code). Often you won't need this second `vault` argument, as in the immediate example below:

```js
const unsubscribe1 = await vault.subscribe(
    state => state.hyperion.meta[manifest.id], // define the selection 
    selection => show(selection, "selection callback") // handle a change to that selection
);
```

Vault's `subscribe` returns a function that you can call to unsubscribe, when needed.

If we start modifying vault, then vault will start calling our subscriptions:

```js
// We get an initial callback when first subscribing.
// Now if we update, we get another:
await vault.setMetaValue([manifest.id, 'MyCustomStorage', 'myKey'], 'myValue2');

// and we can see new metadata:
await vault.setMetaValue([manifest.id, 'MyCustomStorage2', 'myKey2'], 'myValue2');
```

Had we been more specific in our selection, we could have focussed on just one "scope". To see this, first clear our existing subscription:

```js
unsubscribe1();
```

Now set up a _scoped_ subscription:

```js
await vault.subscribe(
    state => state.hyperion.meta[manifest.id]['MyCustomStorage'], // Now listen to just this scope
    selection => show(selection, "specific selection callback") // handle a change to that selection
);

// we see this:
await vault.setMetaValue([manifest.id, 'MyCustomStorage', 'myKey'], 'myValue3'); 
// but now, we don't see this:
await vault.setMetaValue([manifest.id, 'MyCustomStorage2', 'myKey2'], 'myValue4'); 
```

### Subscribing to IIIF changes

The above shows subscriptions on arbitrary data, but we're more likely to be interested in changes to known IIIF entities in vault. Consider this loading of an annotation page:

```js
const canvas10 = vault.fromRef(manifest.items[10]);
const annotationPageId = canvas10.annotations[0].id;

// we can subscribe to changes on this Annotation Page:            
await vault.subscribe(
    state => {
        // When this slice of the store changes...
        const annotationPage = state.hyperion.entities.AnnotationPage[annotationPageId];
        console.log("Vault is obtaining state (anno page has " + annotationPage.items.length + " items).");
        return annotationPage;
    },
    annotationPage => {
        console.log("(callback on change) " + annotationPage.items.length + " items");
        show([getLabel(annotationPage), annotationPage.items.length + " items"], "Annotation Page");
    }
);
```

Vault only has the _reference_ to the annotation page at the moment. This is why it has 0 items. So let's load it (in your application the user might be choosing to load in some external annotations; their interaction action triggers a modification of vault data, and the UI can respond). Changes to vault's state from loading resources will be reflected in subscriptions, but if you directly modify vault resources (e.g., property value), this won't trigger a notification. It's OK to modify vault data this way, but to hook into the subscription, it needs to be mutated via `modifyEntityField` as below:

```js
console.log("Now going to load the anno page");
const annoPage = await vault.load(annotationPageId); // This will trigger it straight away, before the data is loaded

// now make some changes
annoPage.label = [{ "en": ["I have changed the label"] }];
// Making a direct change like this is allowed, and updates the data in Vault, but won't notify subscribers.

// This is how you notify subscribers:
vault.modifyEntityField(annoPage, "label", {  en: ["I have changed the label again"] });

// Now we see the change appear.
```

Metadata and subscriptions are the foundation of some of canvas Panel's built in tools. They use Vault's storage facilities to build application functionality. You can do the same. Event Handlers are a good example.

### Event Handlers in Vault

The set of metadata that Vault can track for any resource includes an _event manager_:

```js
show(vault.getResourceMeta(manifest.id).eventManager, "Event manager for " + manifest.id);
// undefined 

// There is no event manager for this entity, yet. But if we start adding event listeners, one wil be created:
vault.addEventListener(manifest, 'onClick', (e) => {
    console.log("clicked", this);
})

// Now we have one - 
show(vault.getResourceMeta(manifest.id).eventManager, "Event manager for " + manifest.id);
```

Vault's `addEventListener` is very simply a means of storing event handlers for identified resources - that's all it is, it's not raising these events itself. In an application you might have multiple DOM elements that correspond to IIIF resources (e.g., thumbnail images corresponding to canvases). This mechanism gives you the option of storing event handlers alongside other metadata. In practice this low-level API is unlikely to be convenient for direct use, but it is the basis of Canvas Panel's higher level API functions.

If we add a button to our "app", we can give it an event listener that Vault is storing for us.

```js
const manifestButton = document.createElement("button");
manifestButton.innerText = "Click the manifest";
append(manifestButton);

await vault.subscribe(
    state => state.hyperion.meta[manifest.id],
    selection => {
        if (selection && selection.eventManager) {      
            // selection.eventManager.onClick is an array of event handlers that you can attach to your DOM elements.                 
            manifestButton.addEventListener("click", selection.eventManager.onClick[0].callback);
        }
    }
)
```

To conclude this discussion of events, a slightly more realistic example - storing canvases in Vault, and managing click handlers for thumbnails for those canvases.

Here we use Vault's metadata subscription to state for a viewer application. If the loaded manifest changes, we want to react to this:

```js
vault.setMetaValue(["ViewerState", "LoadedResources", "CurrentManifest"], manifest.id);
await vault.subscribe(
    state => state.hyperion.meta["ViewerState"],
    selection => {
        if (selection && selection.LoadedResources) {      
            LoadManifest(selection.LoadedResources.CurrentManifest);
        }
    }
)
```

For clarity, add this `LoadManifest` function to the script after the demo() function. Our click handler for the thumbnails just pulls the corresponding canvas out of Vault and displays the JSON. This is where you could _give the Canvas to Canvas Panel!_

```js
async function LoadManifest(manifestId){
    
    const manifest = await vault.loadManifest(manifestId); 

    for(const canvas of manifest.items){
        // give these handlers a scope, we may wish to have other click handlers for the same canvases elsewhere
        vault.addEventListener(canvas, 'onClick', () => show(vault.fromRef(canvas)), ["Thumbs"]); 
    }

    await vault.subscribe(
        state => state.hyperion.entities.Manifest[manifestId], // (can't subscribe to [manifest.id].items)
        (selection, vault) => {
            // selection is the manifest. When the manifest changes...
            document.getElementById("app").innerHTML = "";                                   
            for(const canvas of selection.items){                 
                // ...create an image element for each canvas         
                const thumb = document.createElement("img");
                const canvasManager = vault.getResourceMeta(canvas.id).eventManager;
                // ...add the event listener we previously stored in Vault
                thumb.addEventListener("click", canvasManager.onClick[0].callback);
                // ...set the src of the image to a vault-picked thumbnail
                vault.getThumbnail(canvas, { maxWidth:100 }).then(cvThumb => thumb.src = cvThumb.best.id); // needs changing if this moves outside Vault
                append(thumb);
            }
        }
    )
}
```

It may be difficult to see the changes in the Canvas JSON as you click different thumbnails, as the structure is the same for all. Look at the canvas labels to see that the page number is different.

Read more on Vault here. 

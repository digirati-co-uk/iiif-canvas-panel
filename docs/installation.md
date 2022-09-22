---
sidebar_position: 1
title: Installation
---

# Installation for development and production

## Components

* [Vault](https://github.com/IIIF-Commons/vault) is the library used by Canvas Panel to load, normalise and track IIIF resources. 
* [Vault-helpers](https://github.com/IIIF-Commons/vault-helpers/) contains additional utilities for working with IIIF resources, such as `getLabel` and `getThumbnail`.
* [Canvas Panel](https://github.com/digirati-co-uk/iiif-canvas-panel) is the web component. Its distribution includes vault and the `canvas-panel` and `image-service` web components.

## Script tag bundle
    
The web components (canvas-panel and image-service) are bundled in one script: 

```html
<script src="https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@latest"></script>

<canvas-panel
  manifest-id="https://digirati-co-uk.github.io/wunder.json"
  canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0">
</canvas-panel>
```

This also gives you access to [Vault](vault), for doing things programmatically:

```html
<canvas-panel id="cp"></canvas-panel>

<script src="https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@latest"></script>
<script>  
    const cp = document.getElementById("cp");
    const manifestUrl = "https://digirati-co-uk.github.io/wunder.json";
    cp.vault.load(manifestUrl).then((manifest) => console.log(manifest.items.length));
</script>  
```

([Read more about Vault](vault))

You can use Vault independently of the Canvas Panel web component:

```html
<script src="https://cdn.jsdelivr.net/npm/@iiif/vault@latest/dist/index.umd.js"></script>
<script>  
    const manifestUrl = "https://digirati-co-uk.github.io/wunder.json";
    const vault = new IIIFVault.Vault();
    vault.load(manifestUrl).then((manifest) => console.log(manifest.items.length));
</script>  
```

The additional vault-helpers library adds some useful utilities:

```html
<canvas-panel id="cp"></canvas-panel>
<h3 id="manifestLabel"></h3>
<h3 id="canvasLabel"></h3>
<img id="thumb" />

<script src="https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/@iiif/vault-helpers@latest/dist/index.umd.js"></script>

<script>  
    
    function $(id){ return document.getElementById(id); }

    const cp = $("cp");
    const helper = IIIFVaultHelpers.createThumbnailHelper(cp.vault);

    async function main(){
        const manifestId = "https://digirati-co-uk.github.io/wunder.json";
        const canvasId = "https://digirati-co-uk.github.io/wunder/canvases/1";
        let manifest = await cp.vault.loadManifest(manifestId);
        $("manifestLabel").innerText = IIIFVaultHelpers.getValue(manifest.label);
        cp.setCanvas(canvasId);
        let thatCanvas = cp.vault.get(canvasId);
        $("canvasLabel").innerText = IIIFVaultHelpers.getValue(thatCanvas.label);
        let thumbSrc = (await helper.getBestThumbnailAtSize(thatCanvas, 200)).best.id;
        $("thumb").src = thumbSrc;
    }

    main();
    
</script>  
```


## NPM / Yarn projects

NPM Projects:
```
npm i @iiif/vault
```

Yarn projects:
```
yarn add @iiif/vault
```

and then import:
```js
import { Vault } from '@iiif/vault';
```
or with RequireJS / Node:
```js
const { Vault }  = require('@iiif/vault');
```


## Modern browser modules
[Example code sandbox](https://codesandbox.io/s/vault-vanilla-g5mzq?file=/index.html:1363-1368)

Include an import map in your `<head />`
```html
<script type="importmap">
  {
    "imports": {
      "@iiif/vault": "https://cdn.jsdelivr.net/npm/@iiif/vault/dist/index.es.js",
      "@iiif/store": "https://cdn.jsdelivr.net/npm/@iiif/store/dist/index.es.js",
      "@iiif/parser": "https://cdn.jsdelivr.net/npm/@iiif/parser/dist/index.es.js",
      "@iiif/presentation-2-parser": "https://cdn.jsdelivr.net/npm/@iiif/presentation-2-parser/dist/index.es.js",
      "@atlas-viewer/iiif-image-api": "https://cdn.jsdelivr.net/npm/@atlas-viewer/iiif-image-api/dist/index.es.js",
      "mitt": "https://cdn.jsdelivr.net/npm/mitt@3.0.0/dist/mitt.mjs",
      "redux": "https://cdn.jsdelivr.net/npm/redux@4.1.2/es/redux.mjs",
      "typesafe-actions": "https://cdn.jsdelivr.net/npm/typesafe-actions@5.1.0/dist/typesafe-actions.es.production.js"
    }
  }
</script>
```
and then create a new script tag:
```html
<script type="module">
    import { Vault } from "@iiif/vault";

    const vault = new Vault();
</script>
```

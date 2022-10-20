---
sidebar_position: 2
---

# Methods


## Reference
Helpers available on components:
* `.vault`  - access to the IIIF Vault, can also be set to a custom vault before mounting.
* `.events` - This is the [events helper](https://iiif-commons.netlify.app/docs/vault-helpers/events) where you can manually set mouse events on IIIF resource (canvas, annotation, annotaiton pages).
* `.styles` - This is the [styles helper](https://iiif-commons.netlify.app/docs/vault-helpers/styles) where you can manually attach styles to IIIF resources. This library supports a limited set of CSS box styles for annotations and annotation pages.
* `.thumbnailHelper` - This is a thumbnail helper that you can use to generate Thumbnails for IIIF resources (`.thumbnailHelper.getBestThumbnailAtSize(resource, options)`).
* `.imageServiceLoader` - This is a IIIF [image serivce loader](https://github.com/atlas-viewer/iiif-image-api/blob/main/src/image-service-loader.ts) that can be used to preload IIIF resources


Methods only available on Canvas panel:
```typescript
interface CanvasPanelAPI {
    setCanvas(id: string);
    setManifest(id: string);
    setDefaultChoiceIds(choiceIds: string[]);
    getDefaultChoiceIds(): string[];
    getCanvasId(): string;
    getManifestId(): string;
    disableTextSelection();
    enableTextSelection();
    enableText();
    disableText();
    easingFunctions(): EasingFunctions;
    getContentStateStack();
    transition(callback: (transitionManager: any) => void);
    enableContentStateSelection(callback: ContentStateCallback);
    disableContentStateSelection();
    setContentStateFromText(text: string);
}
```


Methods available on all components:

```ts
interface PublicAPI {
    getHighlight();
    setHighlight(newHighlight: Selector | Selector[] | undefined);
    getTarget();
    setTarget(newTarget: Selector | Selector[] | undefined);
    setDefaultChoiceIds: (choiceIds: string[]);
    getMaxZoom();
    getMinZoom();
    zoomIn(point?: { x: number; y: number });
    zoomOut(point?: { x: number; y: number });
    zoomBy(factor: number, point?: { x: number; y: number });
    // @deprecated
    zoomTo(factor: number, point?: { x: number; y: number }, stream?: boolean);
    withAtlas(callback: (rt: Runtime) => void);
    goHome(immediate = false);
    getZoom();
    getScaleInformation();
    goToTarget(
      target: {
        x: number;
        y: number;
        height: number;
        width: number;
      },
      options: {
        padding?: number;
        nudge?: boolean;
        immediate?: boolean;
      } = {}
    );
    setFps(frames: number);
    clearTarget();
    setPreferredFormats(formats: string[]);
    getPreferredFormats();
    setMode(mode: 'sketch' | 'explore');
    applyStyles(resource: string | Reference<any>, style: BoxStyle);
    applyHTMLProperties(
        resource: string | Reference<any>,
        style: Partial<{
            className?: string;
            href?: string;
            target?: string;
            title?: string;
        }>
    );
    createAnnotationDisplay(source: any);
    getThumbnail(input: any, request: ImageCandidateRequest, dereference?: boolean);
}
```
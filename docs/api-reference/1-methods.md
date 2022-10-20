---
sidebar_position: 2
---

# Methods

zoomIn(immediate)

zoomOut(immediate)

TBC




```ts
interface PublicAPI {
    vault;
    events;
    styles;
    thumbnailHelper;
    imageServiceLoader;
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
    
    // Canvas panel specific
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
# Missing documentations / fixes

Adding custom fallback or error message add `slot="fallback"` to replace the sad-canvas-panel
```html
<canvas-panel
    canvas-id="https://digirati-co-uk.github.io/wunder/canvases/0"
    manifest-id="https://digirati-co-uk.github.io/wunder.json-DOES_NOT_EXIST">

    <div slot="fallback">Show this instead of an error</div>

</canvas-panel>
```

Ready states
```js
if (!cp.ready) {
  cp.addEventListener('ready', demo);
} else {
  demo();
}
```

or a shorthand:
```js
cp.whenReady(demo);
```

The atlas trapdoor:
```js
cp.withAtlas(runtime => {
   runtime.x;
   runtime.y;
   runtime.width;
   runtime.height;
   
   runtime.worldToViewer(x, y, width, height);
   runtime.viewerToWorld(x, y);
   
   runtime.getScaleFactor();
   
   // Hooks.
  runtime.hooks.useAfterFrame(cb);
  runtime.hooks.useBeforeFrame(cb);
  runtime.hooks.useAfterPaint(cb);
  runtime.hooks.useFrame(cb); // WARNING: causes render ever frame.
   
   // World.
  runtime.world;
   
   // And lots more... (https://github.com/atlas-viewer/atlas/blob/feature/updates/src/renderer/runtime.ts)
})
```

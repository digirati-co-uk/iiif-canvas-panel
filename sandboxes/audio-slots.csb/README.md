# Audio player with IIIF metadata

This is a local fork of [cookbook recipe 0002](https://iiif.io/api/cookbook/recipe/0002-mvm-audio/). `manifest.json`
keeps the original audio URL and duration, adds a canvas label and manifest summary, and uses example identifiers.
`main.ts` preloads it into the panel's Vault before selecting the manifest and canvas.

The heading and description are ordinary text bindings:

```html
<h1 data-bind="label"></h1>
<p data-bind="summary"></p>
```

Each field prefers the active canvas's value and falls back to the manifest independently. Language maps use the
existing IIIF language helper with the browser's language. Missing values become empty strings. Bindings set text
content on leaves, so metadata is never interpreted as HTML. The same resolved `label` and `summary` are available on
`getMediaSlots()` snapshots; updating metadata does not recreate the player.

`native-controls="false"` disables browser controls. The authored controls are projected into `audio-controls` and opt
into `data-canvas-panel-bind`. For this audio-only example, `--atlas-container-display: none` hides the visual canvas
while the native audio element continues to own playback.

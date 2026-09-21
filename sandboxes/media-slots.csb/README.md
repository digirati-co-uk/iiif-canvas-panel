# Native media control slots

A direct child with `slot="video-controls"` or `slot="audio-controls"` is projected through a native shadow slot. It
remains your DOM: Canvas Panel does not clone or reparent it. The outlet is hidden and inert when that media type is
inactive. Native playback controls remain available as an accessible fallback.

Add `data-canvas-panel-bind` to the assigned root to bind ordinary starter HTML. Buttons use `data-action` with `play`,
`pause`, `toggle-play`, `mute`, `unmute` or `toggle-mute`. Range inputs use `seek` (seconds, on change) or `set-volume`
(0–1, on input). `data-bind` accepts `current-time`, `duration`, `volume`, `play-label`, `label` and `summary`.
`data-format="time"` formats seconds; an unknown duration displays `--:--`. Label every range and use native buttons.
Text bindings only update leaves, never HTML or elements containing children.

Framework-owned controls should omit the automatic binding opt-in and subscribe instead:

```ts
const unsubscribe = panel.subscribeMediaSlots(() => {
  const video = panel.getMediaSlots().find((entry) => entry.mediaType === "video");
  // Update framework state from this readonly snapshot; null duration means unknown.
  // Event handlers can invoke video.actions.play(), pause(), seek(seconds), etc.
});
```

Read `getMediaSlots()` immediately as well as subscribing when mounting framework components. Unsubscribe when they
unmount. The snapshot array is stable between changes, so it can also serve React's `useSyncExternalStore`. Each
attachment has its own `key`, `canvasId`, `resourceId`, `slotName` and actions. Additional players of the same type
receive unique slot names listed in their snapshots. Never pick a player by searching the document for a video.

Actions retained after disposal do nothing. Playback failures appear in `error` and emit `media-action-error` on the
panel. Seeks outside available seekable ranges and invalid numeric values are ignored. The new scoped volume action uses
0–1; the older `panel.mediaActions.setVolume()` retains its 0–100 convention.

See the timeline and lazy-slots examples for aggregate playback, templates, factories and replacement media.

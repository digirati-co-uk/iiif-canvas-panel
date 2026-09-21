---
title: Media and slots (v2 preview)
---

Canvas Panel projects application-owned HTML through native `<slot>` elements. React, Vue and Svelte children stay in
the application's framework tree, including its context and event handlers. A hidden slot does not unmount authored
children. Templates and factories provide an explicit way to create content only while an outlet is active.

Try **Mixed-media timeline**, **Timeline: React and web components**, and **Lazy templates and replacement media** on
[the examples page](/all-sandboxes).

## Outlets and state

| Outlet                             | Purpose                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `video-controls`, `audio-controls` | Controls for a simple player                                             |
| `timeline-controls`                | Aggregate timeline controls, with native play/seek fallback              |
| `video`, `audio`                   | Replacement native player for simple media                               |
| Generated media names              | Replacement player for one timeline annotation or additional canvas      |
| `loading`                          | Manifest loading; defaults to the spinner                                |
| `fallback`                         | Load/render errors; defaults to the existing error view                  |
| `unsupported`                      | Unsupported strategy; defaults to a thumbnail or explanatory text        |
| `overlay`                          | Viewport overlay; interactive children should set `pointer-events: auto` |

`panel.getSlots()` returns readonly descriptors for **active** outlets. Subscribe with `panel.subscribeSlots(listener)`
and call the returned unsubscribe function on cleanup. Read the current snapshot immediately too. Use each descriptor's
`key` and `slotName`; generated names are implementation details. Media descriptors include `canvasId`, `resourceId`,
`annotationId` and `mediaType`.

`panel.getMediaSlots()` and `panel.subscribeMediaSlots(listener)` expose playback snapshots. These include readiness,
seek availability, time, duration, paused/muted/volume, buffering, errors, label, summary and scoped actions. A controls
descriptor's `getMediaState()` returns its current playback snapshot. These getters do not subscribe automatically.
Actions retained after an attachment is disposed are inert. Timeline actions always address the aggregate controller.

## Starter HTML

```html
<canvas-panel native-controls="false">
  <div slot="video-controls" data-canvas-panel-bind>
    <button type="button" data-action="toggle-play" data-bind="play-label" disabled>Play</button>
    <input
      type="range"
      min="0"
      step="0.1"
      aria-label="Playback position"
      data-action="seek"
      data-bind="current-time"
      disabled
    />
    <output data-bind="current-time" data-format="time">0:00</output>
  </div>
</canvas-panel>
```

Only the directly assigned root opts into automatic binding. Use `play`, `pause`, `toggle-play`, `mute`, `unmute`,
`toggle-mute`, `seek` (seconds) or `set-volume` (0–1). Bind `current-time`, `duration`, `volume`, `play-label`, `label`
or `summary`. Metadata prefers the canvas, then the manifest, and is inserted as text. Native media controls are on by
default; `native-controls="false"` hides them explicitly. Framework controls with their own handlers should omit
`data-canvas-panel-bind`.

## Lazy templates and factories

Place a template directly inside the panel. It must have one HTML root. Only that inert template is cloned; live
framework nodes are never cloned. Removing the active outlet removes its generated content, leaving the template intact.

```html
<template data-canvas-panel-slot="timeline-controls">
  <div data-canvas-panel-bind>
    <button type="button" data-action="toggle-play" data-bind="play-label" disabled>Play</button>
  </div>
</template>
```

For imperative integrations, register a synchronous factory after element registration. It runs once per active outlet
instance, receives its descriptor, and returns one detached HTML root with optional cleanup. It can subscribe to media
state using the same panel API. Unregistering also disposes any mounted content.

```ts
const unregister = panel.registerSlot("video", ({ resourceId }) => {
  const video = document.createElement("video");
  video.src = resourceId!;
  video.preload = "auto";
  video.playsInline = true;
  return { element: video, dispose: () => video.pause() };
});
// Later: unregister();
```

Choose authored content, one template, or one factory for an outlet. Conflicts emit `slot-error` with `slotName` and
`message`. Authored content takes priority; a template/factory conflict mounts neither. A second factory registration
for the same name throws. An empty authored root still suppresses native slot fallback.

## Replacement media

A media outlet accepts one native `<audio>` or `<video>` of the matching type, either directly assigned or marked
`data-canvas-panel-media` inside its assigned wrapper. Supply its `src` yourself, normally from the descriptor's
`resourceId`, and size it with your own stylesheet. Controls and replacement players use separate outlets.

The default player stays attached until the replacement has loaded playable data. Removal, `emptied` or `error` returns
to the default player; a failed replacement must emit a new readiness event before it can take over again. Detachment
pauses the old node and releases its listeners. Simple media carries over volume, mute, available playback position and
playback intent. Timeline media attaches by annotation identity and takes its time from the existing controller. Keep
native per-item controls off in a timeline so they do not compete with aggregate playback.

Fallback and replacement may both fetch data while readiness is established. There is no automatic blob download for
unseekable media; check `canSeek` and `error` instead. Replacement supports native media elements, not arbitrary player
objects or promises.

## Framework-owned controls

The `/react` entry exports `usePanelSlots(element)` and `useMediaSlots(element)`. The `CanvasPanel` adapter also accepts
`renderSlot(descriptor)`: return a child for a matching descriptor or `null`. The adapter creates the assigned wrapper;
returned components remain under your application's React providers. The paired timeline example demonstrates this with
the decomposed upstream `CanvasPanel.Viewer` and `CanvasPanel.RenderCanvas` beside the web component.

Vue can subscribe in `onMounted`, assign the snapshot to a `shallowRef`, and unsubscribe in `onUnmounted`. Render keyed
children with `:slot="descriptor.slotName"` and `:key="descriptor.key"`. Svelte can do the same in `onMount`, returning
the unsubscribe function, with `{#each descriptors as descriptor (descriptor.key)}`. Both can use ordinary framework
handlers to invoke the current media snapshot's actions. No additional viewer root or framework-specific renderer is
needed.

## Timelines

The shared React IIIF Vault scene handles timed images, overlapping video/audio, cropped sources, timeline gaps and
forward/backward seeks. Media nodes stay attached outside visible intervals; the shared controller owns clocks,
buffering and source offsets. Control snapshots report time at 100 ms precision. Annotation and source updates retain
the controller and unrelated media nodes. Navigation disposes that canvas's attachments and actions.

Painting text is rendered as plain text; rich HTML styling is not supported. Timeline source players remain mounted for
loading and seeking even while invisible. Lazy _controls_ and playback media therefore have different lifetimes.

## Deep zoom viewer controls

The `overlay` outlet also supports opt-in HTML controls, including lazy templates and factory-created roots:

```html
<template data-canvas-panel-slot="overlay">
  <div data-canvas-panel-bind style="pointer-events: auto">
    <button type="button" data-action="zoom-in" disabled>Zoom in</button>
    <button type="button" data-action="zoom-out" disabled>Zoom out</button>
    <button type="button" data-action="go-home" disabled>Home</button>
    <button type="button" data-action="rotate-left" disabled>Rotate left 90°</button>
    <button type="button" data-action="rotate-right" disabled>Rotate right 90°</button>
    <button type="button" data-action="reset-rotation" disabled>Reset rotation</button>
    <output data-bind="view-rotation">0</output>°
  </div>
</template>
```

Buttons use `zoom-in`, `zoom-out`, `go-home`, `rotate-left`, `rotate-right`, or `reset-rotation`. Rotation buttons
animate quarter turns; reset sets the camera angle to zero immediately. Home fits the current rotated view. A
numeric/range input with `data-action="set-view-rotation"` sets an absolute angle on input. A checkbox with
`data-action="set-touch-rotation"` enables/disables two-finger rotation on change. Use `data-bind="view-rotation"` for
the live angle in degrees and `data-bind="touch-rotation"` for checkbox state. Bindings track programmatic changes and
gestures; they do not change the existing object `rotation`.

Only directly assigned roots marked `data-canvas-panel-bind` are managed. Nested custom elements and unmarked roots
retain their own event handling. Controls enable when the viewer outlet is bound and disable when detached; listeners
are released on reassignment or disposal. Gesture events on the opted-in toolbar do not pan or zoom the image. Try
**Deep zoom with slotted viewer controls** on [the examples page](/all-sandboxes) for a complete tiled-image viewer.

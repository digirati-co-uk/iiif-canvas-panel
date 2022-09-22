---
sidebar_position: 24
---

# UI controls


### Deep zoom controls

```html
<canvas-panel zoom-controls="my-zoom-controls" .../>
<script type="text/template" id="my-zoom-controls">
  <div>
    <button data-zoom-in>Zoom in</button>
    <button data-zoom-out>Zoom out</button>
    <button data-zoom-home>Home</button>
  </div>
<script>
```

### Media controls

```html
<canvas-panel media-controls="my-media-controls" .../>
<script type="text/template" id="my-media-controls">
  <div>
    <button data-play-pause>Play/pause</button>
    <div data-scrubber></div> <!-- This will TBC since it requires 3 elements: container, background, progress -->
    <button data-mute>Mute</button>
  </div>
<script>
```
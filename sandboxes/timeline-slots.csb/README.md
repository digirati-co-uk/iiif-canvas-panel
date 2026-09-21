# Mixed-media timeline

`manifest.json` is a shortened fork of
[IIIF cookbook recipe 0489](https://iiif.io/api/cookbook/recipe/0489-multimedia-canvas/). The image service and clock
video are unchanged; timing is shortened to twelve seconds and painting text is plain text.

Canvas Panel uses React IIIF Vault's `RenderComplexTimelineScene` and its controller. Native media is attached by
annotation identity and retained outside its visible intervals. Atlas positions the HTML media and text alongside its
image scene. There is no second playback clock in Canvas Panel.

`timeline-controls` is the aggregate control slot. It uses the same `data-action` and `data-bind` attributes as the
simple audio/video examples. `getMediaSlots()` exposes a snapshot with `strategy: "complex-timeline"` and
`mediaType: "timeline"`. Its actions address the whole sequence. Control time is published at 100 ms precision; the
upstream clock retains its original precision. If no custom controls are assigned, the native slot supplies play and
seek controls. Individual video controls are disabled so that they cannot compete with the timeline controller.

The `2af9a3c` upstream preview also selects timelines for image-only canvases and multiple same-type media. See the
paired React/web-component example for those cases. Rich HTML painting styles are not applied: text is extracted in an
inert template and rendered as text. No media is downloaded into blobs as a seekability workaround.

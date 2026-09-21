import "@digirati/canvas-panel-web-components";

const panel = document.querySelector("canvas-panel")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;

// Framework components can subscribe to the same snapshots and call their scoped actions.
// They should omit data-canvas-panel-bind when their framework owns the event handlers.
const unsubscribe = panel.subscribeMediaSlots(() => {
  const video = panel.getMediaSlots().find((slot) => slot.mediaType === "video");
  status.textContent =
    video?.error || (video?.ready ? "Video ready. Use the custom controls below the video." : "Loading video…");
});

window.addEventListener("pagehide", unsubscribe, { once: true });

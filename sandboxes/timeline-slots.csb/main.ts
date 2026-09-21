import "@digirati/canvas-panel-web-components";
import manifest from "./manifest.json";

const panel = document.querySelector("canvas-panel")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;

// There is one aggregate timeline slot, not an independent player for each media item.
const unsubscribe = panel.subscribeMediaSlots(() => {
  const timeline = panel.getMediaSlots().find((slot) => slot.strategy === "complex-timeline");
  const message =
    timeline?.error ||
    (!timeline?.ready
      ? "Loading timeline…"
      : timeline.buffering
        ? "Buffering…"
        : !timeline.canSeek
          ? "This source is not seekable yet."
          : "Timeline ready.");
  if (status.textContent !== message) status.textContent = message;
});
window.addEventListener("pagehide", unsubscribe, { once: true });

// Preload the cookbook fork; media and image URLs still point to real IIIF resources.
await panel.vault.load(manifest.id, manifest);
panel.setManifest(manifest.id);
panel.setCanvas(manifest.items[0].id);

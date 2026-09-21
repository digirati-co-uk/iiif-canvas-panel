import "@digirati/canvas-panel-web-components";
import "./styles.css";

const panel = document.querySelector("canvas-panel")!;
const toggle = document.querySelector<HTMLInputElement>("#replace")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;
let unregister: (() => void) | undefined;

// A factory runs once per active outlet. It owns only the node it returns.
toggle.addEventListener("change", () => {
  unregister?.();
  unregister = undefined;
  if (!toggle.checked) return;

  unregister = panel.registerSlot("video", ({ resourceId }) => {
    const video = document.createElement("video");
    video.src = resourceId!;
    video.preload = "auto";
    video.playsInline = true;
    video.className = "replacement";
    status.textContent = "Factory mounted. The default player remains available until this video is ready.";

    return {
      element: video,
      dispose() {
        video.pause();
        status.textContent = "Factory cleaned up; the default player is active again.";
      },
    };
  });
});

panel.addEventListener("slot-error", (event) => {
  status.textContent = event.detail.message;
});
window.addEventListener("pagehide", () => unregister?.(), { once: true });
panel.setManifest("https://iiif.io/api/cookbook/recipe/0003-mvm-video/manifest.json");

panel.setCanvas("https://iiif.io/api/cookbook/recipe/0003-mvm-video/canvas");

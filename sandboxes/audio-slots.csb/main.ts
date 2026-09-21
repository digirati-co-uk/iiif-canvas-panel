import "@digirati/canvas-panel-web-components";
import manifest from "./manifest.json";

const panel = document.querySelector("canvas-panel")!;
const player = document.querySelector<HTMLElement>(".player")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;

// Playback and ranges use the declarative bindings. This subscription only updates presentation.
function updatePlayer() {
  const audio = panel.getMediaSlots().find((slot) => slot.mediaType === "audio");
  player.dataset.playing = String(audio?.paused === false);
  const message =
    audio?.error ||
    (!audio?.ready ? "Loading recording…" : audio.buffering ? "Buffering…" : audio.paused ? "Paused" : "Now playing");
  if (status.textContent !== message) status.textContent = message;
}

const unsubscribe = panel.subscribeMediaSlots(updatePlayer);
updatePlayer();
window.addEventListener("pagehide", unsubscribe, { once: true });

// Local fork of cookbook 0002: descriptive metadata added, original audio URL unchanged.
// Preload the JSON so its example.org identifiers never require a network request.
await panel.vault.load(manifest.id, manifest);
panel.setManifest(manifest.id);
panel.setCanvas(manifest.items[0].id);

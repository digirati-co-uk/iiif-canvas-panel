import "@digirati/canvas-panel-web-components/dist/index.css";
import "@digirati/canvas-panel-web-components";
import "./styles.css";

const manifestId = "https://digirati-co-uk.github.io/wunder.json";
const canvasId = "https://digirati-co-uk.github.io/wunder/canvases/2";
const cp = /** @type {import("@digirati/canvas-panel-web-components").CanvasPanelElement | null} */ (
  document.getElementById("cp")
);
if (!cp) throw new Error("Missing canvas-panel #cp");

cp.vault.loadManifest(manifestId).then((manifest) => {
  cp.setCanvas(canvasId);

  cp.addEventListener("dblclick", (event) => {
    cp.zoomBy(1 / 0.7);
  });
});

// A factor greater than 1 zooms in around the current view.
document.getElementById("zoomABit").addEventListener("click", () => cp.zoomBy(1 / 0.7));
document.getElementById("zoomALot").addEventListener("click", () => cp.zoomBy(1 / 0.5));

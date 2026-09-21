import "@digirati/canvas-panel-web-components/dist/index.css";
import "@digirati/canvas-panel-web-components";
import "./styles.css";

const manifestId = "https://digirati-co-uk.github.io/wunder.json";
const canvasId = "https://digirati-co-uk.github.io/wunder/canvases/2";
const cp = document.querySelector("canvas-panel");

if (!cp) throw new Error("Missing canvas-panel element");

// Loading the manifest also makes its canvases available in the Vault.
cp.vault.loadManifest(manifestId).then((manifest) => cp.setCanvas(canvasId));

import '@digirati/canvas-panel-web-components';
import './styles.css';
 
const manifestId = "https://digirati-co-uk.github.io/wunder.json";
const canvasId = "https://digirati-co-uk.github.io/wunder/canvases/2";
const cp = document.getElementById("cp");

cp.vault
    .loadManifest(manifestId)
    .then(manifest => cp.setCanvas(canvasId));

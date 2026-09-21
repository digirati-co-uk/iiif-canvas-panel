import "@digirati/canvas-panel-web-components/dist/index.css";
import "@digirati/canvas-panel-web-components";
import "./styles.css";

const cp = /** @type {import("@digirati/canvas-panel-web-components").CanvasPanelElement | null} */ (
  document.getElementById("cp")
);
if (!cp) throw new Error("Missing canvas-panel #cp");

async function load() {
  await cp.vault.loadManifest("https://iiif.io/api/cookbook/recipe/0005-image-service/manifest.json");
  cp.setCanvas("https://iiif.io/api/cookbook/recipe/0005-image-service/canvas/p1");
  const target = { x: 1000, y: 1900, width: 1500, height: 1000 };
  setTimeout(() => {
    cp.goToTarget(target);
    drawBox();
  }, 1000);
}

load();

async function drawBox() {
  const w3CAnno = {
    id: "https://example.org/anno",
    type: "Annotation",
    motivation: "highlighting",
    target: "https://iiif.io/api/cookbook/recipe/0005-image-service/canvas/p1#xywh=1250,1780,400,400",
  };
  await cp.vault.load(w3CAnno.id, w3CAnno);
  const highlight = cp.createAnnotationDisplay(w3CAnno.id);
  highlight.className = "example-annotation";
  cp.annotations.add(highlight);
  // for a bonus - change the style after three seconds
  setTimeout(() => {
    highlight.applyStyle({
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "green",
      ":hover": {
        borderColor: "orange",
      },
    });
  }, 3000);
}

import "@digirati/canvas-panel-web-components";
import "./styles.css";

const cp = document.getElementById("cp");

async function load() {
  await cp.vault.loadManifest(
    "https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest"
  );
  cp.setCanvas(
    "https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/116"
  );
  const target = { x: 1000, y: 1500, width: 1500, height: 1000 };
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
    target:
      "https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/116#xywh=1250,1780,400,400"
  };
  await cp.vault.load(w3CAnno.id, w3CAnno);
  const highlight = cp.createAnnotationDisplay(w3CAnno.id);
  highlight.className = "example-annotation";
  cp.annotations.add(highlight);

  highlight.applyStyle({
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "green",
    ":hover": {
      borderColor: "orange"
    }
  });
}

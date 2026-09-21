import "@digirati/canvas-panel-web-components/dist/index.css";
import "@digirati/canvas-panel-web-components";
import "./styles.css";

const cp = /** @type {import("@digirati/canvas-panel-web-components").CanvasPanelElement | null} */ (
  document.getElementById("cp")
);
if (!cp) throw new Error("Missing canvas-panel #cp");

async function demo() {
  const manifestWithAnnotations = await cp.vault.loadManifest(
    "https://iiif.wellcomecollection.org/presentation/b18035723",
  );

  const canvas10 = cp.vault.get(manifestWithAnnotations.items[10]);
  cp.setCanvas(canvas10.id);

  for (const annoPage of canvas10.annotations) {
    // External annotation pages must be loaded separately from the manifest.
    let embedded = annoPage.items && !cp.vault.requestStatus(annoPage);

    if (!embedded) {
      console.log(annoPage.id + " needs to be loaded");

      // Resolve the page by its IIIF ID before displaying its annotations.
      const loadedAnnoPage = await cp.vault.load(annoPage.id);
      // These are now loaded into the Vault
      await showSomeAnnotations(canvas10.id, loadedAnnoPage);
    }
  }
}

async function showSomeAnnotations(canvasId, annoPage) {
  const w3cAnno = cp.vault.get(annoPage.items[5]);
  console.log(w3cAnno);
  const displayAnno = cp.createAnnotationDisplay(w3cAnno);
  // displayAnno.className = "my-class";
  displayAnno.applyStyle({
    backgroundColor: "red",
  });
  await new Promise((r) => setTimeout(r, 1000));
  cp.annotations.add(displayAnno);

  const newAnno = {
    type: "Annotation",
    motivation: ["tagging"],
    target: canvasId + "#xywh=300,300,500,500",
  };
  const annoWithId = await cp.vault.load("fake-id", newAnno);
  const displayAnno2 = cp.createAnnotationDisplay(annoWithId);
  displayAnno2.className = "my-class";

  const listener = displayAnno2.addEventListener("onClick", (target, anno) => {
    console.log("clicked " + anno.id + " on " + JSON.stringify(target));
  });
  cp.annotations.add(displayAnno2);

  const linkingAnno = {
    type: "Annotation",
    motivation: ["linking"],
    target: canvasId + "#xywh=300,900,500,500",
  };
  const linkingAnnoWithId = await cp.vault.load("fake-id-2", linkingAnno);
  const displayAnno3 = cp.createAnnotationDisplay(linkingAnnoWithId);
  displayAnno3.className = "my-link-class";
  displayAnno3.href = "https://iiif.io/";
  await new Promise((r) => setTimeout(r, 1000));
  cp.annotations.add(displayAnno3);
}

demo();

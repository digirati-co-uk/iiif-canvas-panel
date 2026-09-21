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

      cp.annotationPageManager.setPageEnabled(loadedAnnoPage.id);
      cp.applyStyles(loadedAnnoPage, {
        border: "3px solid green",
      });
      // cp.applyStyles(loadedAnnoPage, {
      //   backgroundColor: 'red',
      //   border: '1px solid blue',
      // });
    }
  }
}

demo();

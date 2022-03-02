import "@digirati/canvas-panel-web-components";
import "./styles.css";

const cp = document.getElementById("cp");

async function demo() {
  const manifestWithAnnotations = await cp.vault.loadManifest(
    "https://digirati-co-uk.github.io/wunder.json"
  );
  const canvas10 = cp.vault.get(manifestWithAnnotations.items[10]);
  cp.setCanvas(canvas10.id);
  for (const annoPage of canvas10.annotations) {
    // the .annotations property is an array of 0..n AnnotationPage resources.
    // how do we know these are not inline?
    let embedded = annoPage.items && !cp.vault.requestStatus(annoPage);
    if (!embedded) {
      console.log(annoPage.id + " needs to be loaded");
      // As a resource external to the manifest, we load annotations specifically, from their id:
      const loadedAnnoPage = await cp.vault.load(annoPage.id);
      // These are now loaded into the Vault

      // A temporary sleep...
      await new Promise((resovle) => setTimeout(resovle, 500));
      cp.annotationPageManager.setPageEnabled(loadedAnnoPage);
      cp.applyStyles(loadedAnnoPage, {
        border: "3px solid green"
      });
      // cp.applyStyles(loadedAnnoPage, {
      //   backgroundColor: 'red',
      //   border: '1px solid blue',
      // });
    }
  }
  //document.getElementById("output").innerText = msg;
}

demo();

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
      await showSomeAnnotations(canvas10.id, loadedAnnoPage);
    }
  }
  //document.getElementById("output").innerText = msg;
}

async function showSomeAnnotations(canvasId, annoPage) {
  const w3cAnno = cp.vault.get(annoPage.items[5]);
  console.log(w3cAnno);
  const displayAnno = cp.createAnnotationDisplay(w3cAnno);
  // displayAnno.className = "my-class";
  displayAnno.applyStyle({
    background: "red"
  });
  await new Promise((r) => setTimeout(r, 1000));
  cp.annotations.add(displayAnno);

  const newAnno = {
    type: "Annotation",
    motivation: ["tagging"],
    target: canvasId + "#300,300,500,500"
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
    target: canvasId + "#300,900,500,500"
  };
  const linkingAnnoWithId = await cp.vault.load("fake-id-2", linkingAnno);
  const displayAnno3 = cp.createAnnotationDisplay(linkingAnnoWithId);
  displayAnno3.className = "my-link-class";
  displayAnno3.href = "https://iiif.io/";
  await new Promise((r) => setTimeout(r, 1000));
  cp.annotations.add(displayAnno3);
}

demo();
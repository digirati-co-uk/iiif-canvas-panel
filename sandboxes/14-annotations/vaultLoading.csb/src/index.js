import "@digirati/canvas-panel-web-components";
import "./styles.css";

const cp = document.getElementById("cp");

async function demo() {
  // vault load annotation from URL:
  const annoIdTest = "https://tomcrane.github.io/scratch/cp/annos/test-with-same-id.json";
  const annoIdDifferentId = "https://tomcrane.github.io/scratch/cp/annos/test-with-different-id.json";
  const annoIdNoId = "https://tomcrane.github.io/scratch/cp/annos/test-with-no-id.json";

  const annoWithoutIdObj = {
    type: "Annotation",
    motivation: ["highlighting"],
    target: {
      id:
        "https://iiifmediawiki.herokuapp.com/presentation/canvas/c208117.json#xywh=50,990,2100,1755",
      type: "Canvas"
    }
  };

  const annoWithIdObj = {
    id: "https://tomcrane.github.io/scratch/cp/annos/test-with-same-id.json",
    type: "Annotation",
    motivation: ["highlighting"],
    target: {
      id:
        "https://iiifmediawiki.herokuapp.com/presentation/canvas/c208117.json#xywh=50,990,2100,1755",
      type: "Canvas"
    }
  };

  let msg = "\nLoading some individual annotations:";
  const annoTest = await cp.vault.load(annoIdTest);
  msg += "\nloaded anno with id [" + annoTest.id + "] from url " + annoIdTest;
  const annoDifferentId = await cp.vault.load(annoIdDifferentId);
  msg += "\nloaded anno with id [" + annoDifferentId.id + "] from url " + annoIdDifferentId;
  const annoNoId = await cp.vault.load(annoIdNoId);
  msg += "\nloaded anno with id [" + annoNoId.id + "] from url " + annoIdNoId;
  const annoWithoutId = await cp.vault.load("ignored-but-required", annoWithoutIdObj);
  msg += "\nloaded anno with id [" + annoWithoutId.id + "] inline";
  const annoWithId = await cp.vault.load(annoWithIdObj);
  msg += "\nloaded anno with id [" + annoWithId.id + "] inline";

  
  msg += "\n\nLoading an AnnotationPage:";
  const annoPageId = "https://iiif.wellcomecollection.org/annotations/v3/b29437258/b29437258_0003.jp2/line";
  const annoPage = await cp.vault.load(annoPageId);
  msg += "\nloaded " + annoPage.items.length + " annotations on page " + annoPageId;
  
  document.getElementById("output").innerText = msg;
}

demo();

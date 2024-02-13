import "@digirati/canvas-panel-web-components";
import { getValue } from "@iiif/helpers";
import "./styles.css";

async function load() {
  const cp = document.getElementById("cp");
  await cp.vault.loadManifest(
    "https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/manifest.json"
  );
  cp.addEventListener("choice", (e) => {
    let msg = "  Choices: ";
    for (const choice of e.detail.choice.items) {
      msg += "  Choice: " + getValue(choice.label) + "\n";
      msg += "   - Id: " + choice.id + "\n";
    }
    document.getElementById("pseudoUI").innerText = msg;
  });
  cp.setCanvas(
    "https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/canvas/p1"
  );
}

load();

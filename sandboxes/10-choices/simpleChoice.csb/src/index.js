import "@digirati/canvas-panel-web-components/dist/index.css";
import "@digirati/canvas-panel-web-components";
import { getValue } from "@iiif/helpers/i18n";
import "./styles.css";

async function load() {
  const cp = /** @type {import("@digirati/canvas-panel-web-components").CanvasPanelElement | null} */ (
    document.getElementById("cp")
  );
  if (!cp) throw new Error("Missing canvas-panel #cp");

  await cp.vault.loadManifest("https://iiif.io/api/cookbook/recipe/0033-choice/manifest.json");

  // Subscribe before selecting the canvas so the initial choices are captured.
  cp.addEventListener("choice", (e) => {
    let msg = "  Choices: ";

    for (const choice of e.detail.choice.items) {
      msg += "  Choice: " + getValue(choice.label) + "\n";
      msg += "   - Id: " + choice.id + "\n";
    }

    document.getElementById("pseudoUI").innerText = msg;
  });

  cp.setCanvas("https://iiif.io/api/cookbook/recipe/0033-choice/canvas/p1");
}

load();

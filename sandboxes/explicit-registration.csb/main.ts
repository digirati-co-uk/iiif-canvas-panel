import { defineCustomElements, type CanvasPanelElement } from "@digirati/canvas-panel-web-components/elements";
import { Vault } from "react-iiif-vault/core";

const panel = document.getElementById("panel") as CanvasPanelElement;
const vault = new Vault();

// Supply the application Vault before the browser upgrades <canvas-panel>.
panel.vault = vault;

const manifestId = "https://digirati-co-uk.github.io/wunder.json";
const id = "https://digirati-co-uk.github.io/wunder/canvases/2";

// Load the real IIIF data before enabling the registration button.
await vault.loadManifest(manifestId);

(document.getElementById("register") as HTMLButtonElement).disabled = false;
document.getElementById("status")!.textContent = "Manifest loaded; ready to register";

// This listener belongs to the page and survives registration and reconnects.
let clicks = 0;
const child = document.getElementById("child")!;

child.addEventListener("click", () => {
  child.textContent = `Authored child: ${++clicks}`;
});

document.getElementById("register")!.addEventListener("click", () => {
  defineCustomElements();
  defineCustomElements(); // Registration is idempotent.

  panel.setCanvas(id);
  document.getElementById("status")!.textContent =
    panel.vault === vault ? "Pre-upgrade Vault preserved" : "Wrong Vault";
  (document.getElementById("reconnect") as HTMLButtonElement).disabled = false;
});

// Move the same element; its authored children and listeners stay intact.
document.getElementById("reconnect")!.addEventListener("click", () => {
  panel.remove();
  document.getElementById("mount")!.append(panel);
});

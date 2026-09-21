import "@digirati/canvas-panel-web-components/dist/index.css";
import "@digirati/canvas-panel-web-components";
import "./styles.css";

const cp = /** @type {import("@digirati/canvas-panel-web-components").CanvasPanelElement | null} */ (
  document.getElementById("cp")
);
if (!cp) throw new Error("Missing canvas-panel #cp");

cp.addEventListener("click", () => cp.setAttribute("preset", "zoom"));

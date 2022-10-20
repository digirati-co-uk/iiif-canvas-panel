import "@digirati/canvas-panel-web-components";
import "./styles.css";

const cp = document.getElementById("cp");

cp.addEventListener("click", () => cp.setAttribute("preset", "zoom"));

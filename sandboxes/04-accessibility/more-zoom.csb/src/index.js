import "@digirati/canvas-panel-web-components/dist/index.iife.js";
import "./styles.css";

const cp = document.getElementById("cp");

cp.addEventListener("click", () => cp.setAttribute("preset", "zoom"));

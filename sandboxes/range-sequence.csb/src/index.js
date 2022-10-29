import "@digirati/canvas-panel-web-components";
import "@digirati/canvas-panel-web-components/dist/bundle.css";
import "./styles.css";

const cp = document.getElementById("cp");

document.getElementById("range").addEventListener("range-change", (e) => {
  // cp.setAttribute("canvas-id", e.detail.canvasId);
  // if (e.detail.fragment && e.detail.fragment.startsWith("xywh=")) {
  //   cp.setAttribute("target", e.detail.fragment.slice(5));
  // }
  cp.setAttribute("range-id", e.detail.range.id);
  cp.setAttribute("canvas-id", e.detail.canvasId);

  document
    .getElementById("range")
    .setAttribute("selected-range", e.detail.range.id);
});

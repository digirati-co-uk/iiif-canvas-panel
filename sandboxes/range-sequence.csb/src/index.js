import "@digirati/canvas-panel-web-components";
import "@digirati/canvas-panel-web-components/dist/bundle.css";
import "./styles.css";

const seq = document.getElementById("seq");
const next = document.getElementById("next");
const prev = document.getElementById("prev");
const total = document.getElementById("total");

document.getElementById("range").addEventListener("range-change", (e) => {
  // seq.setAttribute("canvas-id", e.detail.canvasId);
  // if (e.detail.fragment && e.detail.fragment.startsWith("xywh=")) {
  //   seq.setAttribute("target", e.detail.fragment.slice(5));
  // }

  if (seq.sequence) {
    seq.sequence.setSequenceIndex(0);
  }
  seq.setAttribute("range-id", e.detail.range.id);
  seq.setAttribute("canvas-id", e.detail.canvasId);

  document
    .getElementById("range")
    .setAttribute("selected-range", e.detail.range.id);
});

seq.addEventListener("sequence-change", (e) => {
  console.log(e.detail, e.detail.total - 1 <= e.detail.index);

  total.innerHTML = `<strong>${e.detail.index + 1}</strong> of <strong>${
    e.detail.total
  } items</strong>`;

  if (e.detail.index === 0) {
    prev.setAttribute("disabled", "true");
  } else {
    prev.removeAttribute("disabled");
  }
  if (e.detail.total - 1 <= e.detail.index) {
    next.setAttribute("disabled", "true");
  } else {
    next.removeAttribute("disabled");
  }
});

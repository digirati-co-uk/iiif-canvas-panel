import "@digirati/canvas-panel-web-components/dist/index.css";
import "@digirati/canvas-panel-web-components";

const seq = document.getElementById("sequence");
const next = document.getElementById("next");
const prev = document.getElementById("prev");

seq.addEventListener("sequence", () => {
  console.log("sequence", seq.sequence);
});

// Navigate through the sequence using its public controller.
next.addEventListener("click", () => {
  seq.sequence.nextCanvas();
});

prev.addEventListener("click", () => {
  seq.sequence.previousCanvas();
});

// Disable navigation at the first and last positions.
seq.addEventListener("sequence-change", (e) => {
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

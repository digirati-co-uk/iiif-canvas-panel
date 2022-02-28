import "@digirati/canvas-panel-web-components";
import "./styles.css";

const cp = document.getElementById("cp");

async function demo(){
  // vault load annotation from URL:
  cp.vault.load("https://iiif-canvas-panel.netlify.app/extra-fixtures/boy-with-straw-hat-highlight.json");

}

demo();
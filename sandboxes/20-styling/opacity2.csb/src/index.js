import "@digirati/canvas-panel-web-components";
import "./styles.css";

// There are three painting annotations on this canvas, the ids of the image resources are:
const image1 =
  "https://dlc.services/iiif-img/7/6/1715f43d-b997-45d2-a5a5-d8a080d4c604/full/full/0/default.jpg";
const image2 =
  "https://dlc.services/iiif-img/7/9/989806db-4e6c-4b08-a47c-79a36c1c1acf/full/full/0/default.jpg";
const image3 =
  "https://dlc.services/iiif-img/7/9/2e519ba0-c6c5-4892-9f36-d96873514630/full/full/0/default.jpg";

const cp = document.getElementById("cp");

// Try swapping image1, image2, image3
cp.applyStyles(image2, { opacity: 0.5 });

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { ImageService } from "./ImageService";
import '@digirati/canvas-panel-web-components';
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { PresetTesting } from "./PresetTesting";

function Home() {
  return <div>
    <ul>
      <li><Link to={"image-service"}>Image Service</Link></li>
      <li><Link to={"region"}>Region</Link></li>
      <li><Link to={"presets"}>Preset testing</Link></li>
    </ul>

  </div>;
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <div><Link to={"/"}>Home</Link></div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/image-service" element={<ImageService />} />
        <Route path="/presets" element={<PresetTesting />} />
        <Route path="/region" element={
          <>
          <canvas-panel
            width={512}
            height={512}
            canvas-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/116"
            manifest-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest"
            region="1000,1500,1000,1000"
            highlight="1250,1780,400,400"
            highlight-css-class="example-annotation"
          />
            <style>{`canvas-panel::part(example-annotation){border: 2px solid blue}`}</style>
          </>
        } />
      </Routes>
    </BrowserRouter>
    {/*<ImageService />*/}
    {/*<DrawingBoxes1 />*/}
    {/*<App/>*/}
  </React.StrictMode>,
  document.getElementById("root")
);


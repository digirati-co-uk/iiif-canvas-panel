import React, { useState } from "react";

export default {title: 'Canvas panel'}

const canvases = [
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2",
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0002.JP2",
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0003.JP2",
]
export const ChangingCanvases = () => {

  const [cv, setCv] = useState(canvases[0]);


  return <>
    <button onClick={()=>setCv(c => canvases[(canvases.indexOf(c) + 1) % canvases.length])}>Next</button>
    {/* @ts-ignore */}
    <canvas-panel manifest-id="https://iiif.wellcomecollection.org/presentation/b18035723" canvas-id={cv} />
  </>
}

export const CanvasWithNavigator = () => {
  {/* @ts-ignore */}
  return <canvas-panel manifest-id="https://iiif.wellcomecollection.org/presentation/b18035723" canvas-id={canvases[0]} enable-navigator="true" />;

}


export const CanvasWithZoomOptions = () => {

  const [cv, setCv] = useState(canvases[0]);
  const [zoomInfo, setZoomInfo] = useState({});
  const [canZoomIn, setCanZoomIn] = useState(false);
  const [canZoomOut, setCanZoomOut] = useState(false);

  const eventListener = function (e) {
    const detail = (e as any).detail;
    setZoomInfo(detail);
    setCanZoomIn(detail.canZoomIn);
    setCanZoomOut(detail.canZoomOut);
    }
  
  setTimeout(() => {
    const panel = document.querySelector("canvas-panel");
    const scaleInfo = (panel as any).getScaleInformation();
    // set the initial state based on the image that's loaded into the canvas
    setCanZoomIn(scaleInfo.canZoomIn);
    setCanZoomOut(scaleInfo.canZoomOut);
    // set the event listener
    panel?.addEventListener("zoom", eventListener);
  }, 100);
  return <>
    <button disabled={!canZoomIn} onClick={() => (document?.querySelector("canvas-panel") as any).zoomIn()}>Zoom In</button> 
    <button disabled={!canZoomOut} onClick={() => (document?.querySelector("canvas-panel") as any).zoomOut()}>Zoom Out</button>
    <br/>
    { JSON.stringify(zoomInfo) }

    {/* @ts-ignore */}
    <canvas-panel manifest-id="https://iiif.wellcomecollection.org/presentation/b18035723" canvas-id={cv} />
  </>
}


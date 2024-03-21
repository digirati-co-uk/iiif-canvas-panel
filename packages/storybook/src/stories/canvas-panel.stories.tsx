import React, { useState, useEffect } from "react";

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



export const CanvasWithSkipSizes = () => {


  const manifestUrl = 'https://media.getty.edu/iiif/manifest/1e0ed47e-5a5b-4ff0-aea0-45abee793a1c'
  const [canvases, setCanvses] = useState([]);
  const [cvindex, setCvindex] = useState(0);
  let panel;
  useEffect(() => {
    panel = document.querySelector("canvas-panel");
    setTimeout(() => {
      setCanvses((panel as any).vault.get(manifestUrl).items.map(item => item.id));
      (panel as any).addEventListener("zoom", (e) => { console.log(e.detail) });
     }, 100);
    panel.addEventListener("ready", (e) => {
      // set the initial state based on the image that's loaded into the canvas
    console.log("ready", e);
    setCanvses((panel as any).vault.get(manifestUrl).items.map(item => item.id));
    (panel as any).addEventListener("zoom", (e)=> {console.log(e.detail)});
    })
  }, [document.querySelector("canvas-panel")]);
  {/* @ts-ignore */ }

  return <>
    {cvindex}
    <button onClick={()=>setCvindex(c => (cvindex - 1) % canvases.length)}>Prev Canvas</button>
    <button onClick={()=>setCvindex(c => (cvindex + 1) % canvases.length)}>Next Canvas</button>
    {/* @ts-ignore */ }
    <canvas-panel manifest-id={manifestUrl} skip-sizes='true' canvas-id={canvases[Math.abs(cvindex)] } />;
  </>

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
  
  useEffect(() => {
    const panel = document.querySelector("canvas-panel");
    // set the initial state based on the image that's loaded into the canvas
    panel?.addEventListener("ready", (e) => {
      setCanZoomIn((e as any).detail.canZoomIn);
      setCanZoomOut((e as any).detail.canZoomOut);
    });
    // set the event listener
    panel?.addEventListener("zoom", eventListener);
    
  }, [document.querySelector("canvas-panel")])
  return <>
    <button disabled={!canZoomIn} onClick={() => (document?.querySelector("canvas-panel") as any).zoomIn()}>Zoom In</button> 
    <button disabled={!canZoomOut} onClick={() => (document?.querySelector("canvas-panel") as any).zoomOut()}>Zoom Out</button>
    <br/>
    { JSON.stringify(zoomInfo) }

    {/* @ts-ignore */}
    <canvas-panel manifest-id="https://iiif.wellcomecollection.org/presentation/b18035723" canvas-id={cv} />
  </>
}


export const SequencePanel = () => {
  {/* @ts-ignore */ }
  return <>
  <button onClick={() => (document.querySelector("sequence-panel") as any).sequence.previousCanvas()}>Prev</button>
    <button onClick={() => (document.querySelector("sequence-panel") as any).sequence.nextCanvas()}>Next</button>
    {/* @ts-ignore */ }
  <sequence-panel manifest-id="https://iiif.wellcomecollection.org/presentation/b18035723" start-canvas={canvases[0]} />
  </>

}

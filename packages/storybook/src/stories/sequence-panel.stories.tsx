import React, { useState, useEffect } from "react";
import { action } from '@storybook/addon-actions';

export default {title: 'Sequence Panel'}

const canvases = [
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2",
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0002.JP2",
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0003.JP2",
]


export const SequencePanel = () => {
  const manifestUrl = 'https://iiif.wellcomecollection.org/presentation/b18035723';
  const [canvases, setCanvses] = useState([]);
  const [cvindex, setCvindex] = useState(0);
  const [zoomInfo, setZoomInfo] = useState({});
  const [canZoomIn, setCanZoomIn] = useState(false);
  const [canZoomOut, setCanZoomOut] = useState(false);


  let panel;
  useEffect(() => {
    panel = document.querySelector("canvas-panel,sequence-panel");
    panel.addEventListener("ready", (e) => { 
      action(e.type)((e as any).detail);
      setCanvses((panel as any).vault.get(manifestUrl).items.map(item => item.id));
    });

    panel.addEventListener("world-ready", (e) => {
      // set the initial state based on the image that's loaded into the canvas
      const detail = (e as any).detail;
      setZoomInfo(detail);
      setCanZoomIn(detail.canZoomIn);
      setCanZoomOut(detail.canZoomOut);
    });
    panel.addEventListener("zoom", (e) => {
      const detail = (e as any).detail;
      setZoomInfo(detail);
      setCanZoomIn(detail.canZoomIn);
      setCanZoomOut(detail.canZoomOut);
    });

    ['zoom', 'world-ready', 'choice', 'move', 'sequence-change', 'media', 'ready', 'zoom', 'range-change','click'].forEach(type => {
      panel.addEventListener(type, (e) => { action(type)(e) });
    })
  }, [document.querySelector("canvas-panel,sequence-panel") !== undefined]);
  {/* @ts-ignore */ }
  return <>
    <button onClick={() => (document.querySelector("sequence-panel") as any).sequence.previousCanvas()}>Prev</button>
    <button onClick={() => (document.querySelector("sequence-panel") as any).sequence.nextCanvas()}>Next</button>
    <button disabled={!canZoomIn} onClick={() => (document?.querySelector("sequence-panel,canvas-panel") as any).zoomIn()}>Zoom In</button> 
    <button disabled={!canZoomOut} onClick={() => (document?.querySelector("sequence-panel,canvas-panel") as any).zoomOut()}>Zoom Out</button>

    {/* @ts-ignore */ }
    <sequence-panel manifest-id={manifestUrl} start-canvas={canvases[0]} />
  </>

}

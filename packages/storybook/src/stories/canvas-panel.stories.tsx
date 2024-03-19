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


export const SequencePanel = () => {
  {/* @ts-ignore */ }
  return <>
  <button onClick={() => document.querySelector("sequence-panel").sequence.previousCanvas()}>Prev</button>
  <button onClick={() => document.querySelector("sequence-panel").sequence.nextCanvas()}>Next</button>
  <sequence-panel manifest-id="https://iiif.wellcomecollection.org/presentation/b18035723" start-canvas={canvases[0]}  />
  </>

}

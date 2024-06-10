import React, { useState, useEffect, useRef } from "react";
import { action } from '@storybook/addon-actions';

export default {title: 'Canvas Panel'}

const canvases = [
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2",
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0002.JP2",
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0003.JP2",
]
const allEvents = ['zoom', 'world-ready', 'choice', 'move', 'canvas-change', 'media', 'ready', 'zoom', 'range-change', 'click'];
const selector = "canvas-panel,sequence-panel";
const saintGines = 'https://media.getty.edu/iiif/manifest/1e0ed47e-5a5b-4ff0-aea0-45abee793a1c';
const welcome = "https://iiif.wellcomecollection.org/presentation/b18035723";


export const ChangingCanvases = () => {

  const [cv, setCv] = useState(canvases[0]);

  return <>
    <button onClick={()=>setCv(c => canvases[(canvases.indexOf(c) + 1) % canvases.length])}>Next</button>
    {/* @ts-ignore */}
    <canvas-panel manifest-id={welcome} canvas-id={cv} />
  </>
}

export const CanvasWithNavigator = () => {
  {/* @ts-ignore */}
  return <canvas-panel manifest-id={welcome} canvas-id={canvases[0]} enable-navigator="true" />;

}


export const CanvasWithGettyTouchInteractions = () => {
  {/* @ts-ignore */}
  return <canvas-panel manifest-id={welcome} canvas-id={canvases[0]}  enable-single-finger-touch='true' enable-pan-on-wait='true' pan-on-wait-delate='40' require-meta-key-for-wheel-zoom='true' />;

}


export const CanvasWithSmallZoom = () => {

  const [canZoomIn, setCanZoomIn] = useState(false);
  const [canZoomOut, setCanZoomOut] = useState(false);
  let panel;
  useEffect(() => {
    panel = document.querySelector(selector);
    
    panel.addEventListener("world-ready", (e) => {
      // set the initial state based on the image that's loaded into the canvas
      const detail = (e as any).detail;
      setCanZoomIn(detail.canZoomIn);
      setCanZoomOut(detail.canZoomOut);
    })


    panel.addEventListener("zoom", (e) => {
      const detail = (e as any).detail;
      setCanZoomIn(detail.canZoomIn);
      setCanZoomOut(detail.canZoomOut);
    });
    allEvents.forEach(type => {
      panel.addEventListener(type, (e) => { action(type)(e) });
    })

  }, [document.querySelector(selector) !== undefined]);


  return <>
    <button disabled={!canZoomIn} onClick={() => (document?.querySelector(selector) as any).zoomIn()}>Zoom In</button> 
    <button disabled={!canZoomOut} onClick={() => (document?.querySelector(selector) as any).zoomOut()}>Zoom Out</button>
    {/* @ts-ignore */}
    <canvas-panel manifest-id={welcome} canvas-id='https://media.getty.edu/iiif/manifest/canvas/eaa531a5-e6ea-46a2-b6cd-a161d726f87b.json' />
  </>
}

export const CanvasWithSkipSizes = () => {


  const manifestUrl = saintGines;
  const [canvases, setCanvses] = useState(['https://media.getty.edu/iiif/manifest/canvas/bb72d5f1-e230-4797-a7dc-262bf948b256']);
  const [cvindex, setCvindex] = useState(0);
  const [zoomInfo, setZoomInfo] = useState({});
  const [canZoomIn, setCanZoomIn] = useState(false);
  const [canZoomOut, setCanZoomOut] = useState(false);


  let panel;
  useEffect(() => {
    panel = document.querySelector(selector);
    let manifest = undefined;
    panel.vault.loadManifest(manifestUrl).then((_manifest) => {
      manifest = _manifest;
      setCanvses((panel as any).vault.get(manifestUrl).items.map(item => item.id));
    })

    
    panel.addEventListener("world-ready", (e) => {
      // set the initial state based on the image that's loaded into the canvas
      const detail = (e as any).detail;
      setZoomInfo(detail);
      setCanZoomIn(detail.canZoomIn);
      setCanZoomOut(detail.canZoomOut);
    })


    panel.addEventListener("zoom", (e) => {
      const detail = (e as any).detail;
      setZoomInfo(detail);
      setCanZoomIn(detail.canZoomIn);
      setCanZoomOut(detail.canZoomOut);
    });
    allEvents.forEach(type => {
      panel.addEventListener(type, (e) => { action(type)(e) });
    })

  }, [document.querySelector(selector) !== undefined]);
  {/* @ts-ignore */ }

  return <>
    <button onClick={()=>setCvindex(c => (cvindex - 1) % canvases.length)}>Prev Canvas</button>
    <button onClick={() => setCvindex(c => (cvindex + 1) % canvases.length)}>Next Canvas</button>
    <button disabled={!canZoomIn} onClick={() => (document?.querySelector(selector) as any).zoomIn()}>Zoom In</button> 
    <button disabled={!canZoomOut} onClick={() => (document?.querySelector(selector) as any).zoomOut()}>Zoom Out</button>

    { canvases[Math.abs(cvindex)] }
    {/* @ts-ignore */}
    <canvas-panel manifest-id={manifestUrl} skip-sizes='true' canvas-id={canvases[Math.abs(cvindex)]  } />
  </>

}


export const CanvasWithContentState = () => {


  const manifestUrl = saintGines;
  const [canvases, setCanvses] = useState(['https://media.getty.edu/iiif/manifest/canvas/bb72d5f1-e230-4797-a7dc-262bf948b256']);
  const [cvindex, setCvindex] = useState(0);
  const [zoomInfo, setZoomInfo] = useState({});
  const [canZoomIn, setCanZoomIn] = useState(false);
  const [canZoomOut, setCanZoomOut] = useState(false);


  let panel;
  let count = 0;
  useEffect(() => {
    panel = document.querySelector(selector);
    let manifest = undefined;
    panel.vault.loadManifest(manifestUrl).then((_manifest) => {
      manifest = _manifest;
      setCanvses((panel as any).vault.get(manifestUrl).items.map(item => item.id));
    })

    
    panel.addEventListener("world-ready", (e) => {
      // set the initial state based on the image that's loaded into the canvas
      const detail = (e as any).detail;
      setZoomInfo(detail);
      setCanZoomIn(detail.canZoomIn);
      setCanZoomOut(detail.canZoomOut);
      if (count == 0) {
        panel.setContentStateFromText("JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRm1lZGlhLmdldHR5LmVkdSUyRmlpaWYlMkZtYW5pZmVzdCUyRmNhbnZhcyUyRmJiNzJkNWYxLWUyMzAtNDc5Ny1hN2RjLTI2MmJmOTQ4YjI1Ni5qc29uJTIzeHl3aCUzRDEwMzMuNDE0NTUwNzgxMjUlMkM0ODMzLjkxNzQ4MDQ2ODc1JTJDMjY1My4zMzEyOTg4MjgxMjUlMkMxMTY3LjEwMTU2MjUlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyQ2FudmFzJTIyJTJDJTIycGFydE9mJTIyJTNBJTVCJTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRm1lZGlhLmdldHR5LmVkdSUyRmlpaWYlMkZtYW5pZmVzdCUyRjFlMGVkNDdlLTVhNWItNGZmMC1hZWEwLTQ1YWJlZTc5M2ExYyUyMiUyQyUyMnR5cGUlMjIlM0ElMjJNYW5pZmVzdCUyMiU3RCU1RCU3RA")
      }
      count++;
    })


    panel.addEventListener("zoom", (e) => {
      const detail = (e as any).detail;
      setZoomInfo(detail);
      setCanZoomIn(detail.canZoomIn);
      setCanZoomOut(detail.canZoomOut);
    });
    allEvents.forEach(type => {
      panel.addEventListener(type, (e) => { action(type)(e) });
    })

  }, [document.querySelector(selector) !== undefined]);
  {/* @ts-ignore */ }

  return <>
    <button onClick={()=>setCvindex(c => (cvindex - 1) % canvases.length)}>Prev Canvas</button>
    <button onClick={() => setCvindex(c => (cvindex + 1) % canvases.length)}>Next Canvas</button>
    <button disabled={!canZoomIn} onClick={() => (document?.querySelector(selector) as any).zoomIn()}>Zoom In</button> 
    <button disabled={!canZoomOut} onClick={() => (document?.querySelector(selector) as any).zoomOut()}>Zoom Out</button>

    { canvases[Math.abs(cvindex)] }
    {/* @ts-ignore */}
    <canvas-panel manifest-id={manifestUrl} skip-sizes='true' canvas-id={canvases[Math.abs(cvindex)]  } />
  </>

}



const bayard="https://gist.githubusercontent.com/danieltbrennan/183d6cbb0948948413394cf116e5844a/raw/11fdda729f0c2960ee1d971902cdf0badd7f31df/bayard_w_choices.json"

export const MakingChoice = () => {
  const viewer = useRef()
  const [canvases, setCanvses] = useState(['']);
  const [cvindex, setCvindex] = useState(0);
  const [choices, setChoices] = useState<any[]>([]);
  let currentCanvasIndex = 0;

  let newChoices = new Set<any>();
  const makeChoice = (e) => {
    viewer.current.makeChoice(e.target.value);
    action('makeChoice')(e.target.value);
  }

  useEffect(() => {
    clearChoiceState();
  }, [cvindex]);
  function clearChoiceState() {
      choices.length = 0;
      setChoices([]);
      newChoices.clear();
  }
  const handleChoice = (e) => {

    if (currentCanvasIndex != cvindex) {
      console.log('resetting', currentCanvasIndex, cvindex);
      currentCanvasIndex = cvindex;
      clearChoiceState();
    } else {
      choices.forEach(opt => { 
        newChoices.add(opt);
      });

    }
    action(e.type)((e as any).detail);
    if (e.detail?.choice?.type == "single-choice") {
      const groupkey = e.detail.choice.items[0].id + '-' + e.detail.choice.items[1].id;
      newChoices.forEach(choice => {
        if (choice.groupkey == groupkey) {
          newChoices.delete(choice);
        }
      })
      e.detail.choice.items.map(item => {
        newChoices.add({ id: item.id, groupkey : groupkey, label: item.label.en[0] , selected: item.selected});
      });

      const choiceList = Array.from(newChoices).sort((a, b) => {
        if (a.groupkey < b.groupkey) {
          return -1;
        }
        if (a.groupkey > b.groupkey) {
          return 1;
        }
        return 0;
      })

      setChoices(choiceList);
    }
  };


  useEffect(() => { 
    viewer.current.addEventListener('choice', handleChoice)
    viewer.current.vault.loadManifest(bayard).then((_manifest) => {
      setCanvses(_manifest.items.map(item => item.id));
    })


    return () => viewer.current.removeEventListener('choice', handleChoice)

  }, [document.querySelector(selector) !== undefined]);



  return <>
    <div>
      <button onClick={()=>setCvindex(c => (cvindex - 1) % canvases.length)}>Prev Canvas</button>
      <button onClick={() => setCvindex(c => (cvindex + 1) % canvases.length)}>Next Canvas</button>

      <label htmlFor="choices">Choices: </label>
        {choices.map(item => (
          <label>
          <input type='radio' key={item.id} checked={item.selected} onChange={makeChoice} name={item.groupkey} value={item.id} ></input>
          { item.label} ({String(item.selected)})</label>
        )
        )}
    
     {/* @ts-ignore */ }
      <canvas-panel ref={viewer} manifest-id={bayard} skip-sizes='true' canvas-id={canvases[Math.abs(cvindex)]  } />
      </div>
    </>
}
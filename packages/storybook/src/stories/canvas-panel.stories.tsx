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

export const RotateCanvas = () => {

  const [rotation, setRotation] = useState(0);
  return <>
    <button onClick={()=>{setRotation((rotation + 90) % 360)}}>Rotate Canvas</button>
    {/* @ts-ignore */}
    <canvas-panel manifest-id={welcome} canvas-id={canvases[0]} rotation={rotation} />
  </>
}

export const CanvasWithNavigator = () => {
  {/* @ts-ignore */}
  return <canvas-panel manifest-id={welcome} canvas-id={canvases[0]} enable-navigator="true" />;

}


export const CanvasWithSmallZoom = () => {

  return ImageViewer(
    {
      manifestUrl: saintGines,
      canvasId: 'https://media.getty.edu/iiif/manifest/canvas/eaa531a5-e6ea-46a2-b6cd-a161d726f87b.json'
    }
  )
}

export const CanvasWithLandscapeZoom = () => {

  return ImageViewer(
    {
      manifestUrl: 'https://media.getty.edu/iiif/manifest/6a744965-6345-41cf-8885-69dd07e25008',
      canvasId : 'https://media.getty.edu/iiif/manifest/78697a2b-31b0-47d9-b1b6-32d7fd67d12c'
    }
  )
}

 export const CanvasWithGettyTouchInteractions = () => {
   {/* @ts-ignore */}
  return <canvas-panel manifest-id={welcome} canvas-id={canvases[0]}  ignore-single-finger-touch='false' enable-pan-on-wait='true' pan-on-wait-delay='40' require-meta-key-for-wheel-zoom='true' />;
 
 }


function ImageViewer(props) {

  const manifestUrl = props.manifestUrl;
  const [canvases, setCanvses] = useState([]);
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
      if (props.onWorldReady &&  count == 0) {
        props.onWorldReady(panel);
        count++;
      }
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
      {props.extra ? props.extra(panel) : ""}
    <button onClick={()=>setCvindex(c => (cvindex - 1) % canvases.length)}>Prev Canvas</button>
    <button onClick={() => setCvindex(c => (cvindex + 1) % canvases.length)}>Next Canvas</button>
    <button disabled={!canZoomIn} onClick={() => (document?.querySelector(selector) as any).zoomIn()}>Zoom In</button> 
    <button disabled={!canZoomOut} onClick={() => (document?.querySelector(selector) as any).zoomOut()}>Zoom Out</button>

    { canvases[Math.abs(cvindex)] }
    {/* @ts-ignore */}
    <canvas-panel manifest-id={manifestUrl} skip-sizes={props.skipSizes? props.skipSizes : false} canvas-id={props.canvasId ? props.canvasId : canvases[Math.abs(cvindex)]  } />
  </>

}


export const CanvasWithSkipSizes = () => {


  return ImageViewer({manifestUrl: saintGines, skipSizes: true})

}

const contentStateNarrowViewport = "JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmlpaWYud2VsbGNvbWVjb2xsZWN0aW9uLm9yZyUyRnByZXNlbnRhdGlvbiUyRmIxODAzNTcyMyUyRmNhbnZhc2VzJTJGYjE4MDM1NzIzXzAwMDEuSlAyJTIzeHl3aCUzRC0xNTI3LjE4Njg4OTY0ODQzNzUlMkM2MTQuODI0NDYyODkwNjI1JTJDNTE2Ni4wOTA0NTQxMDE1NjI1JTJDMjIzNC4wMzgzMzAwNzgxMjUlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyQ2FudmFzJTIyJTJDJTIycGFydE9mJTIyJTNBJTVCJTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmlpaWYud2VsbGNvbWVjb2xsZWN0aW9uLm9yZyUyRnByZXNlbnRhdGlvbiUyRmIxODAzNTcyMyUyMiUyQyUyMnR5cGUlMjIlM0ElMjJNYW5pZmVzdCUyMiU3RCU1RCU3RA";
const contentStateWideViewport = "JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmlpaWYud2VsbGNvbWVjb2xsZWN0aW9uLm9yZyUyRnByZXNlbnRhdGlvbiUyRmIxODAzNTcyMyUyRmNhbnZhc2VzJTJGYjE4MDM1NzIzXzAwMDEuSlAyJTIzeHl3aCUzRC04MTQ5JTJDMCUyQzE4ODY3JTJDMzU0MyUyMiUyQyUyMnR5cGUlMjIlM0ElMjJDYW52YXMlMjIlMkMlMjJwYXJ0T2YlMjIlM0ElNUIlN0IlMjJpZCUyMiUzQSUyMmh0dHBzJTNBJTJGJTJGaWlpZi53ZWxsY29tZWNvbGxlY3Rpb24ub3JnJTJGcHJlc2VudGF0aW9uJTJGYjE4MDM1NzIzJTIyJTJDJTIydHlwZSUyMiUzQSUyMk1hbmlmZXN0JTIyJTdEJTVEJTdE"

export const CanvasWithMultipleContentStates = () => {


  const props = {
    manifestUrl: welcome,
    skipSizes: true,
    extra: () => <>
      <button onClick={()=> (document?.querySelector(selector) as any).setContentStateFromText(contentStateNarrowViewport)} >Narrow</button>
      <button onClick={()=> (document?.querySelector(selector) as any).setContentStateFromText(contentStateWideViewport)} >Wide</button>
    </>
  }

  return ImageViewer(props)
}



export const CanvasWithContentState = () => {

  const props = {
    manifestUrl: saintGines,
    skipSizes: true,
    onWorldReady: (panel) =>
            panel.setContentStateFromText("JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRm1lZGlhLmdldHR5LmVkdSUyRmlpaWYlMkZtYW5pZmVzdCUyRmNhbnZhcyUyRmJiNzJkNWYxLWUyMzAtNDc5Ny1hN2RjLTI2MmJmOTQ4YjI1Ni5qc29uJTIzeHl3aCUzRDEwMzMuNDE0NTUwNzgxMjUlMkM0ODMzLjkxNzQ4MDQ2ODc1JTJDMjY1My4zMzEyOTg4MjgxMjUlMkMxMTY3LjEwMTU2MjUlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyQ2FudmFzJTIyJTJDJTIycGFydE9mJTIyJTNBJTVCJTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRm1lZGlhLmdldHR5LmVkdSUyRmlpaWYlMkZtYW5pZmVzdCUyRjFlMGVkNDdlLTVhNWItNGZmMC1hZWEwLTQ1YWJlZTc5M2ExYyUyMiUyQyUyMnR5cGUlMjIlM0ElMjJNYW5pZmVzdCUyMiU3RCU1RCU3RA")

  }


  return ImageViewer(props)
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
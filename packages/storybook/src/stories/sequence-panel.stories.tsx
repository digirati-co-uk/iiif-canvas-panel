import React, { useState, useEffect, useRef } from "react";

import { action } from '@storybook/addon-actions';

export default {title: 'Sequence Panel'}

const canvases = [
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2",
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0002.JP2",
  "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0003.JP2",
]

const allEvents = ['zoom', 'world-ready', 'choice', 'move', 'canvas-change', 'sequence-change', 'media', 'ready', 'range-change', 'click'];
const selector = "canvas-panel,sequence-panel";

export const SequencePanel = () => {
  const manifestUrl = 'https://iiif.wellcomecollection.org/presentation/b18035723';
  const [canvases, setCanvses] = useState([]);
  const [zoomInfo, setZoomInfo] = useState({});
  const [canZoomIn, setCanZoomIn] = useState(false);
  const [canZoomOut, setCanZoomOut] = useState(false);


  let panel;
  useEffect(() => {
    panel = document.querySelector(selector);
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

    allEvents.forEach(type => {
      panel.addEventListener(type, (e) => { action(type)(e) });
    })
  }, [document.querySelector(selector) !== undefined]);
  {/* @ts-ignore */ }
  return <>
    <button onClick={() => (document.querySelector(selector) as any).sequence.previousCanvas()}>Prev</button>
    <button onClick={() => (document.querySelector(selector) as any).sequence.nextCanvas()}>Next</button>
    <button disabled={!canZoomIn} onClick={() => (document?.querySelector(selector) as any).zoomIn()}>Zoom In</button> 
    <button disabled={!canZoomOut} onClick={() => (document?.querySelector(selector) as any).zoomOut()}>Zoom Out</button>

    {/* @ts-ignore */ }
    <sequence-panel manifest-id={manifestUrl} start-canvas={canvases[0]} />
  </>

}



const bayard="https://gist.githubusercontent.com/danieltbrennan/183d6cbb0948948413394cf116e5844a/raw/11fdda729f0c2960ee1d971902cdf0badd7f31df/bayard_w_choices.json"

export const MakingChoice = () => {
  const viewer = useRef()
  const [toggle, setToggle] = useState();
  const [choices, setChoices] = useState<any[]>([]);
  let currentSequenceIndex = 0;

  let newChoices = new Set<any>();
  const makeChoice = (e) => {
    viewer.current.makeChoice(e.target.value);
    action('makeChoice')(e.target.value);
  }

  function clearChoiceState() {
      choices.length = 0;
      setChoices([]);
      newChoices.clear();
  }
  const handleChoice = (e) => {

    if (currentSequenceIndex != viewer.current.sequence.currentSequenceIndex) {
      console.log('resetting', currentSequenceIndex, viewer.current.sequence.currentSequenceIndex);
      currentSequenceIndex = viewer.current.sequence.currentSequenceIndex;
      clearChoiceState();
    } else {
      choices.forEach(opt => { 
        newChoices.add(opt);
      });

    }
    action(e.type)((e as any).detail);
    if (e.detail?.choice?.type == "single-choice") {
      const groupkey = e.detail.choice.items[0].id + '-' + e.detail.choice.items[1].id;
      console.log(groupkey);
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
    return () => viewer.current.removeEventListener('choice', handleChoice)

  }, [document.querySelector(selector) !== undefined]);



  return <>
    <div>
    <button onClick={() => viewer.current.sequence.setCurrentCanvasIndex(3)}>Go to: Canvas Index 3</button>
    <button onClick={() => viewer.current.sequence.setCurrentCanvasIndex(11)}>Go to: Canvas Index 11</button>
    <button onClick={() => viewer.current.sequence.previousCanvas()}>Prev</button>
    <button onClick={() => viewer.current.sequence.nextCanvas()}>Next</button>
    <button onClick={() => {
      setToggle(!toggle);
      viewer.current.makeChoice(choices.current?.[toggle ? 1 : 0])
    }
  }>Toggle Current Choice</button>
      
    <label htmlFor="choices">All choice ids for canvas index 11: </label>
        {choices.map(item => (
          <label>
          <input type='radio' key={item.id} checked={item.selected} onChange={makeChoice} name={item.groupkey} value={item.id} ></input>
          { item.label} ({String(item.selected)})</label>
        )
        )}
    {JSON.stringify(choices)}
    
     {/* @ts-ignore */ }
      <sequence-panel ref={viewer} manifest-id={bayard} />
      </div>
    </>
}
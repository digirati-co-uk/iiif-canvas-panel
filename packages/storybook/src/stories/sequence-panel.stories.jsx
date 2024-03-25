import React, { useEffect, useState, useRef } from "react";

const bayard="https://gist.githubusercontent.com/danieltbrennan/183d6cbb0948948413394cf116e5844a/raw/11fdda729f0c2960ee1d971902cdf0badd7f31df/bayard_w_choices.json"

export function MakingChoice() {
  const viewer = useRef()
  const [toggle,setToggle] = useState();
  const [choices, setChoices] = useState();

  useEffect(() => {
    const handleChoice = (e) => {
      if (e.detail?.choice?.type == "single-choice") {
        setChoices(e.detail.choice.items.map(e => e.id))
      }
    }
    viewer.current.addEventListener('choice', handleChoice)
    return () => viewer.current.removeEventListener('choice', handleChoice)
  },[choices])
  return <>
    <sequence-panel ref={viewer} manifest-id={bayard} />
    <button onClick={() => viewer.current.sequence.setCurrentCanvasIndex(3)}>Go to: Canvas Index 3</button>
    <button onClick={() => viewer.current.sequence.setCurrentCanvasIndex(11)}>Go to: Canvas Index 11</button>
    <button onClick={() => viewer.current.sequence.previousCanvas()}>Prev</button>
    <button onClick={() => viewer.current.sequence.nextCanvas()}>Next</button>
    <button onClick={() => {
      setToggle(!toggle);
      viewer.current.makeChoice(choices?.[toggle ? 1 : 0])
     }
    }>Toggle Choice</button>
    </>
}

export default {
  name: "makeChoice Example",
  component: MakingChoice,
  title: 'Sequence Panel: Choices',
  tags: ['autodocs'],
}
import React, { useEffect, useState, useRef } from "react";

const bayard="https://gist.githubusercontent.com/danieltbrennan/183d6cbb0948948413394cf116e5844a/raw/11fdda729f0c2960ee1d971902cdf0badd7f31df/bayard_w_choices.json"

export function MakingChoice() {
  const viewer = useRef()
  const [toggle,setToggle] = useState();
  const [choices, setChoices] = useState();
  const [disabled, setDisabled] = useState();
  useEffect(() => {
    const handleChoice = (e) => {
      if (e.detail?.choice?.type == "single-choice") {
        setChoices(e.detail.choice.items.map(e => e.id))
      }

      let currentIndex = viewer.current.sequence.currentSequenceIndex
      setDisabled(!viewer.current.sequence.sequence[currentIndex].includes(11))
    }
    viewer.current.addEventListener('choice', handleChoice)
    return () => viewer.current.removeEventListener('choice', handleChoice)
  },[choices, disabled])

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
    }>Toggle Current Choice</button>
    <label htmlFor="choices">All choice ids for canvas index 11: </label>
    <select  id="choices" disabled={disabled} onInput={ (e) => {
      viewer.current.makeChoice(e.target.value)
    }}>
      <option value="https://media.getty.edu/iiif/image/a252552f-c7ba-4024-aa04-2b31e3185aa0/full/full/None/default.jpg">L (verso)</option>
      <option value="https://media.getty.edu/iiif/image/4dbbc329-d20a-486d-a52b-622d53b5795f/full/full/None/default.jpg">L (recto</option>
      <option value="https://media.getty.edu/iiif/image/d2fcc68f-d0fb-47b8-8187-bbd9e7c2c693/full/full/None/default.jpg">R (verso)</option>
      <option value="https://media.getty.edu/iiif/image/98c207ba-38e0-473f-949c-3de2ac9b9c7e/full/full/None/default.jpg">R (recto)</option>
    </select >
    </>
}

export default {
  name: "makeChoice Example",
  component: MakingChoice,
  title: 'Sequence Panel: Choices',
  tags: ['autodocs'],
}
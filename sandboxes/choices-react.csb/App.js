import { useLayoutEffect, useRef, useState } from "react";
import "./styles.css";
import "@digirati/canvas-panel-web-components/dist/index.iife.js";

export default function App() {
  const viewer = useRef();
  const [choice, setChoice] = useState();
  const disabledChoice = choice
    ? choice.items.filter((i) => i.selected).length === 1
    : false;

  useLayoutEffect(() => {
    const element = viewer.current;
    const onChoice = (event) => setChoice(event.detail.choice);
    element.addEventListener("choice", onChoice);
    return () => element.removeEventListener("choice", onChoice);
  }, []);

  return (
    <div className="App">
      {choice
        ? choice.items.map((item, idx) => {
            return (
              <div key={item.id}>
                <input
                  type="checkbox"
                  disabled={disabledChoice && item.selected}
                  onChange={(e) => {
                    if (idx !== 0 && disabledChoice) {
                      // Select the first (default) choice when another choice is made.
                      viewer.current.makeChoice(choice.items[0].id, {
                        deselectOthers: false,
                      });
                    }
                    viewer.current.makeChoice(item.id, {
                      deselect: item.selected,
                      deselectOthers: false
                    });
                  }}
                  checked={item.selected}
                />
                <strong>{item.label.en.join("")}</strong>
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={100}
                  onChange={(e) => {
                    viewer.current.applyStyles(item.id, {
                      opacity: e.target.value / 100
                    });
                  }}
                />
              </div>
            );
          })
        : null}

      <canvas-panel
        ref={viewer}
        // choice-id={`https://iiif.io/api/image/3.0/example/reference/421e65be2ce95439b3ad6ef1f2ab87a9-dee-xray/full/max/0/default.jpg#opacity=0.5,https://iiif.io/api/image/3.0/example/reference/421e65be2ce95439b3ad6ef1f2ab87a9-dee-natural/full/max/0/default.jpg#opacity=0.25`}
        iiif-content="JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmlpaWYuaW8lMkZhcGklMkZjb29rYm9vayUyRnJlY2lwZSUyRjAwMzMtY2hvaWNlJTJGY2FudmFzJTJGcDElMjN4eXdoJTNEODM3JTJDOTEzJTJDNzcxJTJDMzM0JTIyJTJDJTIydHlwZSUyMiUzQSUyMkNhbnZhcyUyMiUyQyUyMnBhcnRPZiUyMiUzQSU1QiU3QiUyMmlkJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZpaWlmLmlvJTJGYXBpJTJGY29va2Jvb2slMkZyZWNpcGUlMkYwMDMzLWNob2ljZSUyRm1hbmlmZXN0Lmpzb24lMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTWFuaWZlc3QlMjIlN0QlNUQlN0Q"
      />
    </div>
  );
}

import { useLayoutEffect, useRef, useState } from "react";

export function Choices() {
  const viewer = useRef();
  const [choice, setChoice] = useState();
  const disabledChoice = choice
    ? choice.items.filter((i) => i.selected).length === 1
    : false;

  useLayoutEffect(() => {
    viewer.current.addEventListener("choice", (e) => {
      setChoice(e.detail.choice);
    });
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
        iiif-content="JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRnByZXZpZXcuaWlpZi5pbyUyRmNvb2tib29rJTJGMzMzMy1jaG9pY2UlMkZyZWNpcGUlMkYwMDMzLWNob2ljZSUyRmNhbnZhcyUyRnAxJTIzeHl3aCUzRDgzNyUyQzkxMyUyQzc3MSUyQzMzNCUyMiUyQyUyMnR5cGUlMjIlM0ElMjJDYW52YXMlMjIlMkMlMjJwYXJ0T2YlMjIlM0ElNUIlN0IlMjJpZCUyMiUzQSUyMmh0dHBzJTNBJTJGJTJGcHJldmlldy5paWlmLmlvJTJGY29va2Jvb2slMkYzMzMzLWNob2ljZSUyRnJlY2lwZSUyRjAwMzMtY2hvaWNlJTJGbWFuaWZlc3QuanNvbiUyMiUyQyUyMnR5cGUlMjIlM0ElMjJNYW5pZmVzdCUyMiU3RCU1RCU3RA"
      />
    </div>
  );
}

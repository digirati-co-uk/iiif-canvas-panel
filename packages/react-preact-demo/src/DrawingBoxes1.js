import { useLayoutEffect, useState, useRef } from "react";

export function DrawingBoxes1() {
  const viewer = useRef();
  const [choice, setChoice] = useState();


  useLayoutEffect(() => {
    viewer.current.addEventListener('choice', (e) => {
      setChoice(e.detail.choice);
    });
  }, [])

  const disabledChoice = choice ? choice.items.filter(i => i.selected).length === 1 : false;


  return (
    <>
      <script id="base-config" type="application/json">{`{"height": 512, "width": 512}`}</script>
      <style id="my-style">{`
      .example-annotation {
        border: 3px solid blue;
        background: rgba(255, 0, 0, 0.1);
      }
    `}</style>
      {choice ? choice.items.map((item, idx) => {
        return <div key={item.id}>
          <input type="checkbox" disabled={disabledChoice && item.selected} onChange={(e) => {

              viewer.current.makeChoice(item.id, { deselect: item.selected, deselectOthers: false });

          }} checked={item.selected}/>
          <strong>{item.label.en.join('')}</strong>
          <input type="range" min={0} max={100} onChange={e => {
            viewer.current.applyStyles(item.id, {
              opacity: e.target.value/100,
            });
          }} />
        </div>
      }) : null}
      {/*<canvas-panel*/}
      {/*  ref={viewer}*/}
      {/*  choice-id={`https://iiif.io/api/image/3.0/example/reference/421e65be2ce95439b3ad6ef1f2ab87a9-dee-xray/full/max/0/default.jpg#opacity=0.5,https://iiif.io/api/image/3.0/example/reference/421e65be2ce95439b3ad6ef1f2ab87a9-dee-natural/full/max/0/default.jpg#opacity=0.25`}*/}
      {/*  iiif-content="JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRnByZXZpZXcuaWlpZi5pbyUyRmNvb2tib29rJTJGMzMzMy1jaG9pY2UlMkZyZWNpcGUlMkYwMDMzLWNob2ljZSUyRmNhbnZhcyUyRnAxJTIzeHl3aCUzRDgzNyUyQzkxMyUyQzc3MSUyQzMzNCUyMiUyQyUyMnR5cGUlMjIlM0ElMjJDYW52YXMlMjIlMkMlMjJwYXJ0T2YlMjIlM0ElNUIlN0IlMjJpZCUyMiUzQSUyMmh0dHBzJTNBJTJGJTJGcHJldmlldy5paWlmLmlvJTJGY29va2Jvb2slMkYzMzMzLWNob2ljZSUyRnJlY2lwZSUyRjAwMzMtY2hvaWNlJTJGbWFuaWZlc3QuanNvbiUyMiUyQyUyMnR5cGUlMjIlM0ElMjJNYW5pZmVzdCUyMiU3RCU1RCU3RA"*/}
      {/*/>*/}
      <canvas-panel
        ref={viewer}
        preset="zoom"
        manifest-id="https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/manifest.json"
        canvas-id="https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/canvas/p1"
      />
      {/*<canvas-panel*/}
      {/*  class="atlas-test"*/}
      {/*  tabindex={0}*/}
      {/*  iiif-content="JTdCJTIyaWQlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmRhdGEubmctbG9uZG9uLm9yZy51ayUyRmlpaWYlMkYwQ1dSLTAwMDEtMDAwMC0wMDAwJTJGY2FudmFzJTJGMTE2JTIzeHl3aCUzRDI2NjMlMkMxMzY1JTJDOTY2JTJDNDk2JTIyJTJDJTIydHlwZSUyMiUzQSUyMkNhbnZhcyUyMiUyQyUyMnBhcnRPZiUyMiUzQSU1QiU3QiUyMmlkJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZkYXRhLm5nLWxvbmRvbi5vcmcudWslMkZpaWlmJTJGMENXUi0wMDAxLTAwMDAtMDAwMCUyRm1hbmlmZXN0JTIyJTJDJTIydHlwZSUyMiUzQSUyMk1hbmlmZXN0JTIyJTdEJTVEJTdE"*/}
      {/*/>*/}
      {/*<canvas-panel*/}
      {/*  preset="zoom"*/}
      {/*  iiif-content="JTdCJTIyaWQlMjIlM0ElMjAlMjJodHRwcyUzQSUyRiUyRmRhdGEubmctbG9uZG9uLm9yZy51ayUyRmlpaWYlMkYwQ1dSLTAwMDEtMDAwMC0wMDAwJTJGY2FudmFzJTJGMTE2JTIzMTAwMCUyQzE1MDAlMkMxNTAwJTJDMTAwMCUyMiUyQyUyMCUyMnR5cGUlMjIlM0ElMjAlMjJDYW52YXMlMjIlMkMlMjAlMjJwYXJ0T2YlMjIlM0ElMjAlMjJodHRwcyUzQSUyRiUyRmRhdGEubmctbG9uZG9uLm9yZy51ayUyRmlpaWYlMkYwQ1dSLTAwMDEtMDAwMC0wMDAwJTJGbWFuaWZlc3QlMjIlN0Q"*/}
      {/*  highlight="1250,1780,400,400"*/}
      {/*  highlight-css-class="example-annotation"*/}
      {/*  style-id="my-style"*/}
      {/*/>*/}
      {/*<canvas-panel*/}
      {/*  preset="zoom"*/}
      {/*  iiif-content='{"id": "https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/123#1000,1500,1500,1000", "type": "Canvas", "partOf": "https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest"}'*/}
      {/*  highlight="1250,1780,400,400"*/}
      {/*  highlight-css-class="example-annotation"*/}
      {/*  style-id="my-style"*/}
      {/*/>*/}
      {/*<canvas-panel*/}
      {/*  preset="zoom"*/}
      {/*  // preset="https://gist.githubusercontent.com/stephenwf/36e12b67bea9350e080cd9fb5506bc04/raw/aec76bb8817bc9568493bc89f876a5aa6c8a4d0e/static-canvas.json"*/}
      {/*  // render="static"*/}
      {/*  // viewport={false}*/}
      {/*  // interactive={false}*/}
      {/*  // height={512}*/}
      {/*  canvas-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/123"*/}
      {/*  manifest-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest"*/}
      {/*  region="1000,1500,1500,1000"*/}
      {/*  highlight="1250,1780,400,400"*/}
      {/*  highlight-css-class="example-annotation"*/}
      {/*  style-id="my-style"*/}
      {/*  // preset="#base-config"*/}
      {/*/>*/}
      {/*<canvas-panel*/}
      {/*  id="cp2"*/}
      {/*  width={512}*/}
      {/*  height={512}*/}
      {/*  canvas-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/123"*/}
      {/*  manifest-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest"*/}
      {/*  region="1000,1500,1000,1000"*/}
      {/*  highlight="1250,1780,400,400"*/}
      {/*  highlight-css-class="example-annotation"*/}
      {/*  style-id="my-style"*/}
      {/*  // config-id="base-config"*/}
      {/*>*/}
      {/*</canvas-panel>*/}
      {/*<button onClick={() => document.getElementById('cp2')?.goHome()}>^ Home</button>*/}
      {/*<canvas-panel*/}
      {/*  class="custom"*/}
      {/*  width={512}*/}
      {/*  height={512}*/}
      {/*  canvas-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/123"*/}
      {/*  manifest-id="https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest"*/}
      {/*  region="1000,1500,1000,1000"*/}
      {/*  highlight="1250,1780,400,400"*/}
      {/*  highlight-css-class="example-annotation"*/}
      {/*  // config-id="base-config"*/}
      {/*>*/}
      {/*</canvas-panel>*/}

      <style>{`
      canvas-panel.custom::part(example-annotation) {
        border: 3px solid cornflowerblue;
        background: rgba(255, 0, 0, 0.1);  
      }
      canvas-panel.custom::part(example-annotation--hover) {
        border: 3px solid cornflowerblue;
        background: rgba(255, 0, 0, 0.4);
      }
      `}</style>
    </>
  );
}

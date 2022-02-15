import { AnnotationDisplay } from "@digirati/canvas-panel-web-components";
import { useRef, useState } from "react";

function App() {
  const cp = useRef();
  const [mode, setMode] = useState("explore");
  const [interactive, setInteractive] = useState(true);

  const changeCanvas = () => {
    if (cp.current) {
      cp.current.setCanvas("https://iiif.wellcomecollection.org/presentation/b28929780/canvases/b28929780_0006.jp2");
    }
  };

  const goTo = (reg) => {
    if (cp.current) {
      cp.current.goToTarget(reg);
    }
  };
  const goHome = (reg) => {
    if (cp.current) {
      cp.current.goHome();
    }
  };

  const switchMode = () => {
    setMode(m => m === "explore" ? "sketch" : "explore");
  };

  const getPages = (reg) => {
    if (cp.current) {
      const pages = cp.current.annotationPageManager.availablePageIds;
      const page = pages[1];
      if (page) {
        // Annotation page (full)
        cp.current?.applyStyles(page, {
          border: "2px solid yellow",
          backgroundColor: "transparent",
          ":hover": {
            borderColor: "green",
            backgroundColor: "rgb(0, 180, 0, .3)"
          }
        });
        cp.current.annotationPageManager.setPageEnabled(page, { deselectOthers: true });
        if (!cp.current.vault.requestStatus(page)) {
          cp.current.vault.load(page);
        }
      }
    }
  };

  const limitFrames = () => {
    cp.current?.setFps(30);
  };

  const toggleInteractive = () => {
    setInteractive(i => !i);
  }

  const addAnnotation3 = () => {
    if (cp.current) {
      const display = cp.current.createAnnotationDisplay("https://iiif.wellcomecollection.org/presentation/b28929780/canvases/b28929780_0004.jp2/supplementing/t1");

      display.className = 'blue-background';
      display.classList.add('green-border');

      cp.current.annotations.add(display);
    }
  };

  const addAnnotation2 = () => {

    let i = false;

    if (cp.current) {
      // cp.current?.vault.load("https://iiif.wellcomecollection.org/annotations/v3/b28929780/b28929780_0004.jp2/line").then(() => {
      console.log({ ...cp.current });
      const display = cp.current.createAnnotationDisplay("https://iiif.wellcomecollection.org/presentation/b28929780/canvases/b28929780_0004.jp2/supplementing/t0");
      display.applyStyle({
        // border: '2px solid green',
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "green",
        ":hover": {
          borderColor: "orange"
        }
      });

      let timeout = setInterval(() => {
        if (i) {
          console.log("apply pink");
          display.applyStyle({ borderColor: "pink" });
        } else {
          console.log("apply green");
          display.applyStyle({ borderColor: "green" });
        }
        i = !i;
      }, 2000);

      display.onBeforeRemove = () => {
        clearTimeout(timeout);
      }

      display.addEventListener('onClick', () => {
        console.log('on click thing');
      })


      cp.current?.annotations.add(display);
      // });
    }

  };

  const addAnnotation = () => {

    // Annotation page (display)
    cp.current?.annotations.applyStyles("https://iiif.wellcomecollection.org/annotations/v3/b28929780/b28929780_0004.jp2/line", {
      border: "2px solid orange",
      ":hover": {
        borderColor: "green"
      }
    });

    // Annotation
    cp.current?.vault.load("https://iiif.wellcomecollection.org/annotations/v3/b28929780/b28929780_0004.jp2/line").then(() => {
      cp.current?.applyStyles("https://iiif.wellcomecollection.org/presentation/b28929780/canvases/b28929780_0004.jp2/supplementing/t0", {
        backgroundColor: "red",
        ":hover": {
          backgroundColor: "blue"
        },
        ":active": {
          backgroundColor: "pink"
        }
      });
      cp.current?.annotations.add("https://iiif.wellcomecollection.org/presentation/b28929780/canvases/b28929780_0004.jp2/supplementing/t0");
    });
  };

  const removeAnnotation = () => {
    cp.current?.annotations.remove("https://iiif.wellcomecollection.org/presentation/b28929780/canvases/b28929780_0004.jp2/supplementing/t0");
  };


  return (
    <div>
      <button onClick={() => console.log({ ...cp.current })}>LOG</button>
      <button onClick={() => goHome()}>Home</button>
      <button onClick={() => changeCanvas()}>CHANGE CANVAS</button>
      <button onClick={() => limitFrames()}>LIMIT</button>
      <button onClick={() => getPages()}>GET PAGES</button>
      <button onClick={() => addAnnotation()}>Add annotation</button>
      <button onClick={() => toggleInteractive()}>{interactive ? 'ACTIVE' : 'IN-ACTIVE'}</button>
      <button onClick={() => addAnnotation2()}>Add annotation 2</button>
      <button onClick={() => addAnnotation3()}>Add annotation (class)</button>
      <button onClick={() => removeAnnotation()}>Remove annotation</button>
      <button onClick={() => switchMode()}>Switch mode ({mode})</button>
      <button onClick={() => goTo({ x: 500, y: 1000, width: 500, height: 500 }, { padding: 20 })}>GOTO</button>
      <div>
        <canvas-panel
          debug="false"
          interactive={interactive}
          atlas-mode={mode}
          render="canvas"
          ref={cp}
          manifest-id="https://iiif.wellcomecollection.org/presentation/b28929780"
          canvas-id="https://iiif.wellcomecollection.org/presentation/b28929780/canvases/b28929780_0004.jp2"
          preset="#my-config"
        />
        <script type="json" id="my-config">{`
          {
            "styleId": "css",
            "height": 800,
            "viewport": false,
            "media": {
              "(min-width: 300px)": { 
                "viewport": true
              }
            }
          }
        `}</script>
        <style id="css">{`.blue-background{background: rgba(0,0,255,.5)}.green-border{border:1px solid lime}`}</style>
      </div>
    </div>
  );
}

export default App;

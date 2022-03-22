import { useEffect, useRef } from "react";

export function Disappear() {
  const scriptTag = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = `        
          async function load() {
            const cp = document.getElementById("cp");
            await cp.vault.loadManifest("https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/manifest.json");
            cp.addEventListener("choice", (e) => {
              let msg = "  Choices: ";
              for (const choice of e.detail.choice.items) {
                msg += "  Choice: " + (choice.label.en[0]) + "\\n";
                msg += "   - Id: " + choice.id + "\\n";
              }
              document.getElementById("pseudoUI").innerText = msg;
            });
            cp.setCanvas("https://preview.iiif.io/cookbook/3333-choice/recipe/0033-choice/canvas/p1");
          }
          
          load();
          
    `;
    scriptTag.current.appendChild(script);
  }, []);

  return (
    <>
      <div ref={scriptTag} />
      <div style={{ width: 388 }}>
        <canvas-panel render="static" id="cp" height="300" />
      </div>
      <pre id="pseudoUI" />
    </>
  );
}

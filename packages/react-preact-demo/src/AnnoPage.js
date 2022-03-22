import { useEffect, useRef } from "react";

export function AnnoPage() {
  const scriptTag = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = `
  
          async function demo() {
          const cp = document.getElementById("cp");
            const manifestWithAnnotations = await cp.vault.loadManifest(
              "https://digirati-co-uk.github.io/wunder.json"
            );
            const canvas10 = cp.vault.get(manifestWithAnnotations.items[10]);
            cp.setCanvas(canvas10.id);
            for (const annoPage of canvas10.annotations) {
              // the .annotations property is an array of 0..n AnnotationPage resources.
              // how do we know these are not inline?
              let embedded = annoPage.items && !cp.vault.requestStatus(annoPage);
              if (!embedded) {
                console.log(annoPage.id + " needs to be loaded");
                // As a resource external to the manifest, we load annotations specifically, from their id:
                const loadedAnnoPage = await cp.vault.load(annoPage.id);
                // These are now loaded into the Vault
                console.log('Setting enabled');
                // A temporary sleep...
                cp.annotationPageManager.setPageEnabled(loadedAnnoPage.id);
                cp.applyStyles(loadedAnnoPage, {
                  border: "3px solid green"
                });
                // cp.applyStyles(loadedAnnoPage, {
                //   backgroundColor: 'red',
                //   border: '1px solid blue',
                // });
              }
            }
            //document.getElementById("output").innerText = msg;
          }
          
          demo();
          
    `;
    scriptTag.current.appendChild(script);
  }, []);

  return (
    <>
      <div ref={scriptTag} />
      <style id="my-style">{`
        canvas-panel {
          --atlas-background: #f0f0f0;
          --atlas-container-height: calc(100vh - 200px);
        }
        .my-class {
          background: rgba(50, 0, 200, 0.4);
        }
      `}</style>
      <canvas-panel style-id="my-style" id="cp" />
    </>
  );
}

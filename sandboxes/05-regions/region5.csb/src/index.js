import '@digirati/canvas-panel-web-components';
import './styles.css';

// click the sandbox Run button to run this demo

async function show(){
    const cp = document.getElementById("cp");
    await cp.vault.loadManifest("https://iiif.wellcomecollection.org/presentation/b14658197");
    cp.setCanvas("https://iiif.wellcomecollection.org/presentation/b14658197/canvases/b14658197.jp2");
    cp.setAttribute("region", "900,900,1000,1000");
    
    // you can also move the viewport later, e.g., in a narrative view:
    // ...time passes, handle a user action:  
    setTimeout(() => cp.setAttribute("region", "2000,1200,456,987"), 2000);

    // You can also set up an animation
    setTimeout(() => {
      cp.transition(tm => {
        tm.goToRegion({
          height: 965,
          width: 1695,
          x: 2449,
          y: 1062,
        }, {
          transition: {
            easing: cp.easingFunctions().easeOutExpo,
            duration: 2000,
          },
        });
      });
    }, 5000);
}

show();

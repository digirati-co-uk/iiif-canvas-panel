import '@digirati/canvas-panel-web-components';
import './styles.css';

// click the sandbox Run button to run this demo

async function show(){
    const cp = document.getElementById("cp");
    await cp.vault.loadManifest("https://iiif.wellcomecollection.org/presentation/b14658197");
    cp.setCanvas("https://iiif.wellcomecollection.org/presentation/b14658197/canvases/b14658197.jp2");

    await new Promise(resolve => setTimeout(resolve, 500));
    const myTarget = { x: 2000, y: 2000, width: 2000, height: 1500 }
    const myOptions = { padding: 20, nudge: true, immediate: false } 
    cp.goToTarget(myTarget, myOptions);
}

show();
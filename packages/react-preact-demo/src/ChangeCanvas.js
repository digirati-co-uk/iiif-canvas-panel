import { useLayoutEffect, useRef } from "react";

export function ChangeCanvas() {
  const cp = useRef();

  useLayoutEffect(() => {

    setTimeout(() => {

      cp.current.setAttribute('canvas-id', 'https://data.getty.edu/museum/api/iiif/id:826/canvas/other/978155/');

    }, 4000);

  }, [])

  return <canvas-panel ref={cp} manifest-id="https://data.getty.edu/museum/api/iiif/826/manifest.json"
  canvas-id="https://data.getty.edu/museum/api/iiif/id:826/canvas/main"

  />
}

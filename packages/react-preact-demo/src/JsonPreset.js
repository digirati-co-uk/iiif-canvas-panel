import { useLayoutEffect, useRef } from "react";

export function JsonPreset() {
  const cp = useRef();

  useLayoutEffect(() => {
    cp.current.addEventListener("media", (e) => {
      console.log("Media event", e.detail);
    });
  });

  return (
    <>
      <script id="my-preset" type="application/json">
        {`
          {
            "styleId": "css",
            "height": 300,
            "region": "1000,1000,1000,1000",
            "media": {
              "(min-width: 800px)": {
                "height": 500,
                "region": "2000,2000,1000,1000"
              },
              "(min-width: 1200px)": {
                "height": 700,
                "region": "2358,1177,1460,657"
              }
            }
          }
      `}
      </script>
      <canvas-panel
        ref={cp}
        preset="#my-preset"
        manifest-id="https://iiif.wellcomecollection.org/presentation/b14658197"
        canvas-id="https://iiif.wellcomecollection.org/presentation/b14658197/canvases/b14658197.jp2"
      />
    </>
  );
}

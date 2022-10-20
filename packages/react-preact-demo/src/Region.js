import { useEffect, useRef } from "react";

export function Region() {
  const ref = useRef(undefined);

  useEffect(() => {
    ref.current.vault
      .loadManifest(
        "https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/manifest"
      )
      .then(() => {
        ref.current.setCanvas(
          "https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/123"
        );
        const target = { x: 1000, y: 1500, width: 1500, height: 1000 };
        setTimeout(() => {
          ref.current.goToTarget(target);
          drawBox();
        }, 1000);
      });
  }, []);

  async function drawBox() {
    const w3CAnno = {
      id: "https://example.org/anno",
      type: "Annotation",
      motivation: "highlighting",
      target:
        "https://data.ng-london.org.uk/iiif/0CWR-0001-0000-0000/canvas/123#xywh=1250,1780,400,400",
    };
    await ref.current.vault.load(w3CAnno.id, w3CAnno);
    const highlight = ref.current.createAnnotationDisplay(w3CAnno.id);
    highlight.className = "example-annotation";
    ref.current.annotations.add(highlight);
  }

  return (
    <>
      <style>
        {`canvas-panel::part(example-annotation) { background: red; }`}
      </style>
      <canvas-panel ref={ref} />
    </>
  );
}

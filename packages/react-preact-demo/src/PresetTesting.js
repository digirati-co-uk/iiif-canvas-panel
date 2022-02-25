export function PresetTesting() {


  const preset = {
    render: 'zoom',
    canvasId: "https://preview.iiif.io/cookbook/3333-choice/recipe/0036-composition-from-multiple-images/canvas/p1",
    manifestId: "https://gist.githubusercontent.com/stephenwf/19e61dac5c329c77db8cf22fe0366dad/raw/04971529e364063ac88de722db786c97e2df0e6b/manifest.json",
    height: 600,
    width: 1800,
  };

  return <>
    <script id="my-preset">
      {JSON.stringify(preset)}
    </script>
    <canvas-panel preset="#my-preset" />
  </>;
}

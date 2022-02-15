import { useAfterFrame, useRuntime } from '@atlas-viewer/atlas';
import { RegionHighlight } from '../atlas-components/RegionHighlight/RegionHighlight';
import { Fragment, h } from 'preact';
import { useState } from 'preact/compat';

export function Debug() {
  const rt = useRuntime();
  const [focalPosition, setFocalPosition] = useState<any>();
  const [homePosition, setHomePosition] = useState<any>();

  useAfterFrame(() => {
    if (
      rt &&
      (!focalPosition ||
        rt.focalPosition[1] !== focalPosition[1] ||
        rt.focalPosition[2] !== focalPosition[2] ||
        rt.focalPosition[3] !== focalPosition[3] ||
        rt.focalPosition[4] !== focalPosition[4])
    ) {
      setFocalPosition(new Float32Array(rt.focalPosition));
    }
    if (
      rt &&
      (!homePosition ||
        rt.homePosition[1] !== homePosition[1] ||
        rt.homePosition[2] !== homePosition[2] ||
        rt.homePosition[3] !== homePosition[3] ||
        rt.homePosition[4] !== homePosition[4])
    ) {
      setHomePosition(new Float32Array(rt.homePosition));
    }
  }, [focalPosition, homePosition]);

  return (
    <Fragment>
      {focalPosition ? (
        <RegionHighlight
          id="focal"
          onClick={() => {
            // no-op
          }}
          onSave={() => {
            // no-op
          }}
          isEditing={false}
          className="test"
          region={{
            id: 'focal',
            x: focalPosition[1],
            y: focalPosition[2],
            width: focalPosition[3] - focalPosition[1],
            height: focalPosition[4] - focalPosition[2],
          }}
          style={{
            backgroundColor: 'rgba(0, 0, 244, 0.5)',
          }}
        />
      ) : null}
      {homePosition ? (
        <RegionHighlight
          id="home"
          onClick={() => {
            // no-op
          }}
          onSave={() => {
            // no-op
          }}
          isEditing={false}
          className="test"
          region={{
            id: 'home',
            x: homePosition[1],
            y: homePosition[2],
            width: homePosition[3] - homePosition[1],
            height: homePosition[4] - homePosition[2],
          }}
          style={{
            backgroundColor: 'rgba(0, 200, 0, 0.5)',
          }}
        />
      ) : null}
    </Fragment>
  );
}

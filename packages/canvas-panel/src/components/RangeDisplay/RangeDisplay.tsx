import { RangeContext, useManifest, useVault } from 'react-iiif-vault';
import { findManifestSelectedRange, getValue } from '@iiif/helpers';
import { ViewRange } from './ViewRange';
import { h } from 'preact';
import { Fragment, useLayoutEffect } from 'preact/compat';
import { RangeNormalized } from '@iiif/presentation-3-normalized';
import './RangeDisplay.css';

export function RangeDisplay(props: {
  canvasId?: string;
  selectedRange?: string;
  autoScroll?: boolean;
  onRangeClick?: (range: RangeNormalized, other: any) => void;
}) {
  const manifest = useManifest();
  const vault = useVault();

  if (!manifest) {
    throw new Error('No manifest');
  }

  const selected = props.canvasId
    ? findManifestSelectedRange(vault, manifest, props.canvasId)
    : props.selectedRange
      ? vault.get<RangeNormalized>(props.selectedRange)
      : undefined;

  useLayoutEffect(() => {
    if (selected && props.autoScroll) {
      const found = document.querySelector(`[data-range-id="${selected.id}"]`);
      if (found) {
        found.scrollIntoView({
          block: 'nearest',
          behavior: 'auto',
        });
      }
    }
  }, [selected]);

  if (!manifest || !manifest.structures.length) {
    return <slot name="no-range" />;
  }

  return (
    <Fragment>
      {selected ? <div className="range-current">{getValue(selected.label)}</div> : null}

      {manifest.structures.map((range: any) => (
        <RangeContext key={range.id} range={range.id}>
          <ViewRange selected={selected?.id} onRangeClick={props.onRangeClick} />
        </RangeContext>
      ))}
    </Fragment>
  );
}

import { findFirstCanvasFromRange, getValue, parseSelector, ParsedSelector } from '@iiif/vault-helpers';
import { RangeContext, useRange, useVault } from 'react-iiif-vault';

import { useMemo } from 'react';
import { h } from 'preact';
import { RangeNormalized } from '@iiif/presentation-3';

export function ViewRange(props: { selected?: string; onRangeClick?: (range: RangeNormalized, other: any) => void }) {
  const range = useRange();
  const vault = useVault();
  const first = useMemo(() => range?.items.find((i) => i.type === 'Canvas'), [range]);
  const hasSubsequentRanges = useMemo(() => !!range?.items.find((i) => i.type === 'Range'), [range]);
  const selected = props.selected && props.selected === range?.id; // @todo how to get the selected?

  function onClick() {
    if (range && props.onRangeClick) {
      const data: {
        canvasId?: string;
        isLeaf: boolean;
        fragment?: string;
        selector?: string;
        parsedSelector?: ParsedSelector;
      } = {
        isLeaf: !hasSubsequentRanges,
      };
      if (first) {
        const [cid, hash] = first.id?.split('#');
        data.selector = first.id;
        data.canvasId = cid as string;
        data.fragment = hash as string;
      } else if (range) {
        const found = findFirstCanvasFromRange(vault, range);
        if (found) {
          const [cid, hash] = found.id?.split('#');
          data.selector = found.id;
          data.canvasId = cid;
          data.fragment = hash;
        }
      }

      if (data.selector) {
        try {
          data.parsedSelector = parseSelector(data.selector);
        } catch (e) {
          // ignore.
        }
      }

      props.onRangeClick(range, data);
    }
  }

  if (!range) {
    return null;
  }

  return (
    <ul
      className="range-item-container"
      data-leaf={!hasSubsequentRanges}
      data-selected={selected}
      data-with-selector={first?.id?.indexOf('#') !== -1}
      data-range-id={range.id}
    >
      {range.label ? (
        <li className="range-split" onClick={onClick}>
          <span className="range-label">{getValue(range.label)}</span>
        </li>
      ) : null}
      {hasSubsequentRanges ? (
        <div className="range-nested-container">
          {range.items.map((range) => {
            if (range.type === 'Canvas' || (range as any).type === 'SpecificResource' || !range.id) {
              return null;
            }

            return (
              <RangeContext key={range.id} range={range.id}>
                <ViewRange onRangeClick={props.onRangeClick} selected={props.selected} />
              </RangeContext>
            );
          })}
        </div>
      ) : null}
    </ul>
  );
}

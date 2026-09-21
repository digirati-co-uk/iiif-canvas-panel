import { getValue } from '@iiif/helpers';
import { RangeContext, useRange, useVault } from 'react-iiif-vault/core';

import { useMemo } from 'react';
import { createElement as h } from 'react';
import type { RangeNormalized } from '@iiif/parser/presentation-3-normalized/types';
import { getRangeTarget } from '../../helpers/range-target';

export function ViewRange(props: {
  selected?: string;
  onRangeClick?: (range: RangeNormalized, other: any) => void;
}) {
  const range = useRange();
  const vault = useVault();
  const first = useMemo(
    () => range && getRangeTarget(vault, range),
    [vault, range],
  );
  const hasSubsequentRanges = useMemo(
    () => !!range?.items.find((i) => i.type === 'Range'),
    [range],
  );
  const selected = props.selected && props.selected === range?.id; // @todo how to get the selected?

  function onClick() {
    if (range && props.onRangeClick) {
      props.onRangeClick(range, {
        ...first,
        isLeaf: !hasSubsequentRanges,
      });
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
      data-with-selector={!!first?.parsedSelector?.selector}
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
            if (range.type !== 'Range' || !range.id) {
              return null;
            }

            return (
              <RangeContext key={range.id} range={range.id}>
                <ViewRange
                  onRangeClick={props.onRangeClick}
                  selected={props.selected}
                />
              </RangeContext>
            );
          })}
        </div>
      ) : null}
    </ul>
  );
}

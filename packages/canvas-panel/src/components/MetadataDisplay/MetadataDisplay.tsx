import React, { useMemo } from 'react';
import { InternationalString } from '@iiif/presentation-3';
import { h } from 'preact';
import { getValue } from '@iiif/vault-helpers';
import './MetadataDisplay.css';

type FacetConfig = {
  id: string;
  label: InternationalString;
  keys: string[];
  values?: FacetConfigValue[];
};

type FacetConfigValue = {
  id: string;
  label: InternationalString;
  values: string[];
  key: string;
};

export const MetaDataDisplay: React.FC<{
  config?: FacetConfig[];
  metadata?: Array<{ label: InternationalString; value: InternationalString } | null>;
  variation?: 'table' | 'list';
  labelStyle?: 'muted' | 'bold' | 'caps' | 'small-caps';
  labelWidth?: number;
  allowHtml?: boolean;
  bordered?: boolean;
  showEmptyMessage?: boolean;
  separator?: string;
}> = ({
  metadata = [],
  config,
  variation = 'table',
  labelWidth = 16,
  bordered,
  labelStyle,
  showEmptyMessage,
  allowHtml,
  separator,
}) => {
  const options = { separator };
  const metadataKeyMap = useMemo(() => {
    const flatKeys = (config || []).reduce((state, i) => {
      return [...state, ...i.keys];
    }, [] as string[]);

    const map: { [key: string]: Array<{ label: InternationalString; value: InternationalString }> } = {};
    for (const item of metadata) {
      const labels = item && item.label ? Object.values(item.label) : [];
      for (const label of labels) {
        if (
          label &&
          label.length &&
          (flatKeys.indexOf(`metadata.${label[0]}`) !== -1 || flatKeys.length === 0) &&
          item
        ) {
          const key = `metadata.${label[0]}`;
          map[key] = map[key] ? map[key] : [];
          map[key].push(item);
          break;
        }
      }
    }
    return map;
  }, [config, metadata]);

  const isEmpty = Object.keys(metadataKeyMap).length === 0;

  if (isEmpty && showEmptyMessage) {
    return <slot name="empty" />;
  }

  if (config && config.length) {
    return (
      <table data-variation={variation} data-label-style={labelStyle} data-bordered={bordered}>
        <slot slot="header" />
        <tbody>
          {config.map((configItem, idx: number) => {
            const values: any[] = [];

            for (const key of configItem.keys) {
              for (const item of metadataKeyMap[key] || []) {
                values.push(
                  <div key={idx + '__' + key}>
                    {allowHtml ? (
                      <span dangerouslySetInnerHTML={{ __html: getValue(item.value, options) }} />
                    ) : (
                      getValue(item.value, options)
                    )}
                  </div>
                );
              }
            }

            if (values.length === 0) {
              return null;
            }

            return (
              <tr className="metadata-row" key={idx}>
                <td className="metadata-key" style={labelWidth ? { minWidth: labelWidth } : {}}>
                  {allowHtml ? (
                    <span dangerouslySetInnerHTML={{ __html: getValue(configItem.label, options) }} />
                  ) : (
                    getValue(configItem.label, options)
                  )}
                </td>
                <td className="metadata-value">{values}</td>
              </tr>
            );
          })}
        </tbody>
        <slot name="footer" />
      </table>
    );
  }

  return (
    <table data-variation={variation} data-label-style={labelStyle} data-bordered={bordered}>
      <slot name="header" />
      <tbody>
        {metadata && metadata.length ? (
          metadata.map((metadataItem, idx: number) => {
            if (!metadataItem) {
              return null; // null items.
            }
            return (
              <tr className="metadata-row" key={idx}>
                <td className="metadata-key" style={labelWidth ? { minWidth: labelWidth } : {}}>
                  {allowHtml ? (
                    <span dangerouslySetInnerHTML={{ __html: getValue(metadataItem.label, options) }} />
                  ) : (
                    getValue(metadataItem.label, options)
                  )}
                </td>
                <td className="metadata-value">
                  {allowHtml ? (
                    <span dangerouslySetInnerHTML={{ __html: getValue(metadataItem.value, options) }} />
                  ) : (
                    getValue(metadataItem.value, options)
                  )}
                </td>
              </tr>
            );
          })
        ) : (
          <slot name="empty-table" />
        )}
      </tbody>
      <slot name="footer" />
    </table>
  );
};

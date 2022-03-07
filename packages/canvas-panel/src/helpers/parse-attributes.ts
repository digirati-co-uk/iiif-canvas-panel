import { parseSize, SizeParameter } from './size-parameter';
import { Selector } from '@iiif/presentation-3';
import { ParsedSelector, parseSelector } from 'react-iiif-vault';
import {
  ContentState,
  normaliseContentState,
  NormalisedContentState,
  parseContentState,
} from './content-state/content-state';

export function parseSizeParameter(
  input: undefined | string | SizeParameter | Array<SizeParameter> | Array<string>
): Array<SizeParameter> {
  if (!input) {
    return [];
  }

  if (typeof input === 'string') {
    input = input.split('|');
  }

  if (!Array.isArray(input)) {
    input = [input];
  }

  const sizes = [];
  for (let size of input) {
    if (typeof size === 'string') {
      size = parseSize(size);
    }

    sizes.push(size);
  }
  return sizes;
}

export function parseOptionalSelector(s: Selector | Selector[] | undefined): ParsedSelector | undefined {
  if (typeof s === 'string') {
    const parsed = s.match(/^(pct|pixel|percent)?:?([0-9,\s]+)/);
    if (parsed) {
      return parseOptionalSelector({
        type: 'FragmentSelector',
        value: `xywh=${parsed[1] ? (parsed[1] === 'pixel' ? 'pixel:' : 'percent:') : ''}${parsed[2]}`,
      });
    }
  }

  return s ? parseSelector(s) : undefined;
}

export function parseCSV(s: undefined | string | string[]): string[] {
  if (!s) {
    return [];
  }
  if (Array.isArray(s)) {
    return s;
  }
  if (s.indexOf(',') !== -1) {
    return s.split(',').map((r) => r.trim());
  }
  return [s];
}

export function parseChoices(s: undefined | string | string[]) {
  const values = parseCSV(s);
  const choices: Array<{ id: string; opacity?: number }> = [];
  for (const value of values) {
    const [id, hash] = value.split('#');
    if (hash) {
      const opacityMatch = hash.match(/opacity=([01]?\.[0-9]+)/);
      if (opacityMatch) {
        const opacity = parseFloat(opacityMatch[1]);
        if (opacity < 1 && opacity >= 0) {
          choices.push({ id, opacity });
          continue;
        }
      }
    }
    choices.push({ id });
  }

  return choices;
}

export function parseBool(bool: undefined | boolean | string, defaultValue?: boolean): boolean | undefined {
  if (typeof bool === 'undefined') {
    return defaultValue;
  }
  if (typeof bool === 'string') {
    return bool.toLowerCase() === 'true';
  }
  if (defaultValue) {
    return typeof bool === 'undefined' ? defaultValue : false;
  }
  return bool;
}

export function parseNumber(num?: string | number | undefined | null, defaultValue?: number) {
  if (typeof num === 'undefined' || num === null || num === '') {
    return defaultValue;
  }

  if (typeof num === 'string') {
    num = parseInt('' + num, 10);
  }

  if (typeof num !== 'undefined' && !Number.isNaN(num)) {
    return num;
  }

  return defaultValue;
}

export function parseContentStateParameter(
  contentState?: ContentState | string
): NormalisedContentState | { type: 'remote-content-state'; id: string } | null {
  if (!contentState) {
    return null;
  }

  if (typeof contentState === 'string' && contentState.startsWith('http')) {
    return { type: 'remote-content-state', id: contentState };
  }

  try {
    return normaliseContentState(typeof contentState === 'string' ? parseContentState(contentState) : contentState);
  } catch (err) {
    return null;
  }
}

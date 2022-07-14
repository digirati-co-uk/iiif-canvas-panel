import { Selector } from '@iiif/presentation-3';
import { SizeParameter } from '../helpers/size-parameter';

export type GenericAtlasComponent<T = Record<never, never>, Props = any> = T & {
  region?: Selector | Selector[] | undefined; // same as target.
  target?: Selector | Selector[] | undefined;
  highlight?: Selector | Selector[] | undefined;
  highlightCssClass?: string;
  preferredFormats?: string | string[];
  render?: 'static' | 'canvas' | 'webgl';
  interactive?: boolean;
  atlasMode?: 'sketch' | 'explore';
  virtualSizes?: string | SizeParameter | Array<SizeParameter> | Array<string>;
  styleId?: string;
  preset?: string;
  stylesheet?: string;
  responsive?: boolean;
  disableKeyboardNavigation?: boolean;
  clickToEnableZoom?: boolean;
  viewport?: boolean;
  debug?: boolean;
  media?: Record<string, Partial<GenericAtlasComponent<T>>>;
  height?: number | string;
  width?: number | string;
  class?: string;
  x?: number | string;
  y?: number | string;
  nested?: boolean | string;
  enableNavigator?: boolean;
  __registerPublicApi?: (api: (host: HTMLElement) => Partial<Props>) => void;
};

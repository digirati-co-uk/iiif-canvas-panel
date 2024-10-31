import { AtlasProps } from '@atlas-viewer/atlas';
import { ParsedSelector } from 'react-iiif-vault';
import { SizeParameter } from '../../helpers/size-parameter';

export type AtlasDisplayOptions = AtlasProps & {
  width?: number;
  height?: number;
  aspectRatio?: number;
  viewport?: boolean;
  responsive?: boolean;
  rotation?: number;
};

export type ViewCanvasProps = {
  canvasId?: string;
  renderMultiple?: boolean;
  background?: string;
  canvasIndex?: number;
  homePosition?: ParsedSelector | undefined;
  highlight?: ParsedSelector | undefined;
  highlightCssClass?: string;
  followAnnotations?: boolean;
  virtualSizes: SizeParameter[];
  displayOptions: AtlasDisplayOptions;
  children?: any;
  debug?: boolean;
  mode?: 'sketch' | 'explore';
  className?: string;
  interactive?: boolean;
  defaultChoices?: Array<{ id: string; opacity?: number }>;
  x?: number;
  y?: number;
  margin?: number;
  textEnabled?: boolean;
  textSelectionEnabled?: boolean;
  disableThumbnail?: boolean;
  skipSizes?: boolean;
  homeCover?: boolean | 'start' | 'end';
  rotation?: number;
};

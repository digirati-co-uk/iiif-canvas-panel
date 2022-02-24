import { AtlasProps } from '@atlas-viewer/atlas';
import { ChoiceDescription, ParsedSelector } from 'react-iiif-vault';
import { SizeParameter } from '../../helpers/size-parameter';

export type AtlasDisplayOptions = AtlasProps & {
  width?: number;
  height?: number;
  aspectRatio?: number;
  viewport?: boolean;
  responsive?: boolean;
};

export type ViewCanvasProps = {
  canvasId?: string;
  canvasIndex?: number;
  homePosition?: ParsedSelector | undefined;
  highlight?: ParsedSelector | undefined;
  highlightCssClass?: string;
  followAnnotations?: boolean;
  virtualSizes: SizeParameter[];
  displayOptions: AtlasDisplayOptions;
  onChoiceChange?: (choice?: ChoiceDescription) => void;
  children?: any;
  debug?: boolean;
  className?: string;
  interactive?: boolean;
  defaultChoices?: Array<{ id: string; opacity?: number }>;
};

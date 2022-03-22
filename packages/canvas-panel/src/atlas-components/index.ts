import { createAtlasWrapper } from './create-atlas-wrapper';
import * as Atlas from '@atlas-viewer/atlas';
import { BoxStyle } from '@atlas-viewer/atlas';

export const WorldObject = createAtlasWrapper<{
  height: number;
  scale?: number;
  width: number;
  x?: number;
  y?: number;
}>({
  displayName: 'Atlas.WorldObject',
  component: Atlas.WorldObject,
});

export const Box = createAtlasWrapper<
  {
    interactive?: boolean;
    relativeStyle?: boolean;
    backgroundColor?: string;
    className?: string;
    href?: string;
    hrefTarget?: string;
    title?: string;
    border?: string;
    target?: { x?: number; y?: number; width: number; height: number };
    style?: BoxStyle;
  },
  Atlas.Box
>({
  displayName: 'Atlas.Box',
  component: Atlas.Box,
});

export const SingleImage = createAtlasWrapper<{
  uri: string;
  priority?: boolean;
  target: { x?: number; y?: number; width: number; height: number };
  display?: { width: number; height: number };
  style?: any;
}>({
  displayName: 'Atlas.SingleImage',
  component: Atlas.SingleImage,
});

export const ImageTexture = createAtlasWrapper<{
  getTexture: Atlas.UpdateTextureFunction;
  target: { x?: number; y?: number; width: number; height: number };
  display: { width: number; height: number };
}>({
  displayName: 'Atlas.ImageTexture',
  component: Atlas.ImageTexture,
});

export const CompositeResource = createAtlasWrapper<{
  id?: string;
  width: number;
  height: number;
  renderOptions?: Partial<{
    renderSmallestFallback: boolean;
    renderLayers: number;
    minSize: number;
    maxImageSize: number;
    quality: number;
  }>;
}>({
  displayName: 'Atlas.CompositeResource',
  component: Atlas.CompositeResource,
  customConstructor: (props: any) => {
    return new Atlas.CompositeResource({
      id: props.id,
      width: props.width,
      height: props.height,
      images: [],
      renderOptions: props.renderOptions,
    });
  },
});

export const TiledImage = createAtlasWrapper<{
  uri: string;
  display: { width: number; height: number };
  tile: { width: number; height?: number };
  scaleFactor: number;
  style?: any;
}>({
  displayName: 'Atlas.TiledImage',
  component: Atlas.TiledImage,
  customConstructor: (props) => {
    return Atlas.TiledImage.fromTile(props.uri, props.display, props.tile, props.scaleFactor);
  },
});

export const Text = createAtlasWrapper<{
  interactive?: boolean;
  id?: string;
  color?: string;
  textAlign?: string;
  lineHeight?: number;
  backgroundColor?: string;
  target?: { x?: number; y?: number; width: number; height: number };
  children?: string;
  paddingX?: number;
  paddingY?: number;
  fontSize?: number;
  fontFamily?: string;
}>({
  displayName: 'Atlas.Text',
  component: Atlas.Text,
});

export * from './TileSet/TileSet';

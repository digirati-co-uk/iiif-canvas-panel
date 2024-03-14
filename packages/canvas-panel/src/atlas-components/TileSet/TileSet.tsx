import { GetTile } from '@atlas-viewer/atlas';
import { h } from 'preact';
import { FC, useMemo } from 'preact/compat';
import { imageServiceRequestToString, parseImageServiceUrl } from '@atlas-viewer/iiif-image-api';
import { WorldObject, CompositeResource, SingleImage, TiledImage } from '..';

export const TileSet: FC<{
  viewport?: boolean;
  tiles: GetTile;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: any;
  tileFormat?: string;
  skipSizes?: boolean;
  skipThumbnail?: boolean;
}> = (props) => {
  const scale = props.width / props.tiles.width;
  const tiles = props.tiles.imageService.tiles || [];
  const sizes = props.tiles.imageService.sizes || [];
  const skipSizes = props.skipSizes || false;
  const skipThumbnail = props.skipThumbnail || false;
  const imageServiceId = props.tiles.imageService.id || (props.tiles.imageService['@id'] as string);
  const canonicalId = useMemo(() => {
    const id = imageServiceId;
    if (id && id.endsWith('/info.json')) {
      return id.slice(0, -1 * '/info.json'.length);
    }
    return id;
  }, [imageServiceId]);

  const hasOpacity = props.style && typeof props.style.opacity !== 'undefined' && props.style.opacity !== 1;

  return (
    <WorldObject
      key={canonicalId}
      scale={scale}
      height={props.tiles.height}
      width={props.tiles.width}
      x={props.x}
      y={props.y}
    >
      <CompositeResource
        key={'composite-' + canonicalId}
        id={canonicalId}
        width={props.tiles.width}
        height={props.tiles.height}
        renderOptions={
          hasOpacity
            ? {
                renderLayers: 1,
                renderSmallestFallback: false,
              }
            : props.viewport
            ? {
                renderLayers: 1,
                renderSmallestFallback: true,
              }
            : {
                renderLayers: 2,
                renderSmallestFallback: true,
              }
        }
      >
        {props.children}
        {props.tiles.thumbnail && !hasOpacity && !skipThumbnail ? (
          <SingleImage
            uri={props.tiles.thumbnail.id}
            target={{ width: props.tiles.width, height: props.tiles.height }}
            display={{ width: props.tiles.thumbnail.width, height: props.tiles.thumbnail.height }}
            style={props.style}
          />
        ) : null}
        {skipSizes
          ? null
          : sizes.map((size, n) => {
              const { prefix, server, scheme, path } = parseImageServiceUrl(canonicalId);
              return (
                <SingleImage
                  key={n}
                  uri={imageServiceRequestToString(
                    {
                      scheme,
                      server,
                      prefix,
                      identifier: path,
                      originalPath: '',
                      type: 'image',
                      region: { full: true },
                      size: { max: false, upscaled: false, confined: false, width: size.width, height: size.height },
                      rotation: { angle: 0, mirror: false },
                      format: 'jpg',
                      quality: 'default',
                    },
                    props.tiles.imageService
                  )}
                  target={{ width: props.tiles.width, height: props.tiles.height }}
                  display={{ width: size.width, height: size.height }}
                  style={props.style}
                />
              );
            })}
        {tiles.map((tile: any) =>
          (tile.scaleFactors || []).map((size: number) => {
            return (
              <TiledImage
                key={`${tile}-${size}`}
                uri={canonicalId}
                display={{ width: props.tiles.width, height: props.tiles.height }}
                tile={tile}
                scaleFactor={size}
                style={props.style}
                format={props.tileFormat}
              />
            );
          })
        )}
      </CompositeResource>
    </WorldObject>
  );
};

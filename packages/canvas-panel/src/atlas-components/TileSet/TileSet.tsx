import { GetTile } from '@atlas-viewer/atlas';
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
}> = ({
  height,
  tiles,
  width,
  x,
  y,
  style,
  skipSizes = false,
  skipThumbnail = false,
  viewport,
  tileFormat,
  children,
  ...props
}) => {
  const scale = width / tiles.width;
  const serviceTiles = tiles.imageService.tiles || [];
  const sizes = tiles.imageService.sizes || [];
  const imageServiceId = tiles.imageService.id || (tiles.imageService['@id'] as string);
  const canonicalId = useMemo(() => {
    const id = imageServiceId;
    if (id && id.endsWith('/info.json')) {
      return id.slice(0, -1 * '/info.json'.length);
    }
    return id;
  }, [imageServiceId]);

  const hasOpacity = style && typeof style.opacity !== 'undefined' && style.opacity !== 1;

  return (
    <WorldObject
      key={canonicalId}
      scale={scale}
      height={tiles.height}
      width={tiles.width}
      x={x}
      y={y}
      {...(props as any)}
    >
      <CompositeResource
        key={'composite-' + canonicalId}
        id={canonicalId}
        width={tiles.width}
        height={tiles.height}
        renderOptions={
          hasOpacity
            ? {
                renderLayers: 1,
                renderSmallestFallback: false,
              }
            : viewport
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
        {children}
        {tiles.thumbnail && !hasOpacity && !skipThumbnail ? (
          <SingleImage
            uri={tiles.thumbnail.id}
            target={{ width: tiles.width, height: tiles.height }}
            display={{ width: tiles.thumbnail.width, height: tiles.thumbnail.height }}
            style={style}
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
                    tiles.imageService
                  )}
                  target={{ width: tiles.width, height: tiles.height }}
                  display={{ width: size.width, height: size.height }}
                  style={style}
                />
              );
            })}
        {serviceTiles.map((tile: any) =>
          (tile.scaleFactors || []).map((size: number) => {
            return (
              <TiledImage
                key={`${tile}-${size}`}
                uri={canonicalId}
                display={{ width: tiles.width, height: tiles.height }}
                tile={tile}
                scaleFactor={size}
                style={style}
                format={tileFormat}
              />
            );
          })
        )}
      </CompositeResource>
    </WorldObject>
  );
};

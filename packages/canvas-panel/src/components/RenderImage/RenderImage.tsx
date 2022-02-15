import { SingleImage, TileSet } from '../../atlas-components';
import React from 'preact/compat';
import { h } from 'preact';
import { ImageWithOptionalService, useStyles } from 'react-iiif-vault';
import { ImageCandidate } from '@atlas-viewer/iiif-image-api';
import { SizeParameter } from '../../helpers/size-parameter';
import { getImageUrl } from '../../helpers/get-image-url';

export function RenderImage({
  id,
  image,
  thumbnail,
  virtualSizes = [],
}: {
  id: string;
  image: ImageWithOptionalService;
  thumbnail?: ImageCandidate;
  virtualSizes?: SizeParameter[];
}) {
  // For image resources, we may not support everything.. but we do support opacity.
  const style = useStyles({ id, type: 'ContentResource' }, 'atlas');

  return (
    <React.Fragment>
      {!image.service ? (
        <SingleImage
          style={style}
          uri={image.id}
          target={image.target}
          display={
            image.width && image.height
              ? {
                  width: image.width,
                  height: image.height,
                }
              : undefined
          }
        />
      ) : (
        <TileSet
          key={image.service.id}
          tiles={{
            id: image.service.id,
            height: image.height as number,
            width: image.width as number,
            imageService: image.service as any,
            thumbnail: thumbnail && thumbnail.type === 'fixed' ? thumbnail : undefined,
          }}
          x={image.target?.x}
          y={image.target?.y}
          width={image.target?.width}
          height={image.target?.height}
          style={style}
        >
          {image.service &&
            virtualSizes.map((size) => {
              if (image.service) {
                const [url, { height, width }] = getImageUrl(image.service, size);

                if (!url) {
                  return null;
                }

                return (
                  <SingleImage
                    priority
                    style={style}
                    key={url}
                    uri={url}
                    target={image.target}
                    display={{ height, width }}
                  />
                );
              }
              return null;
            })}
        </TileSet>
      )}
    </React.Fragment>
  );
}

import { SingleImage, TileSet } from '../../atlas-components';
import React from 'preact/compat';
import { h } from 'preact';
import { ImageWithOptionalService, useStyles } from 'react-iiif-vault';
import { ImageCandidate } from '@atlas-viewer/iiif-image-api';
import { SizeParameter } from '../../helpers/size-parameter';
import { getImageUrl } from '../../helpers/get-image-url';
import { Fragment } from 'preact/compat';

export function RenderImage({
  id,
  image,
  thumbnail,
  isStatic,
  virtualSizes = [],
  x = 0,
  y = 0,
  annotations,
  tileFormat,
}: {
  id: string;
  image: ImageWithOptionalService;
  thumbnail?: ImageCandidate;
  isStatic?: boolean;
  virtualSizes?: SizeParameter[];
  x?: number;
  y?: number;
  annotations?: JSX.Element;
  tileFormat?: string;
}) {
  // For image resources, we may not support everything.. but we do support opacity.
  const style = useStyles({ id, type: 'ContentResource' }, 'atlas');

  return (
    <React.Fragment>
      {!image.service ? (
        <Fragment key="no-service">
          <SingleImage
            style={style}
            uri={image.id}
            target={image.target.spatial}
            display={
              image.width && image.height
                ? {
                    width: image.width,
                    height: image.height,
                  }
                : undefined
            }
          />
          {annotations}
        </Fragment>
      ) : (
        <Fragment key="service">
          <TileSet
            viewport={isStatic}
            tiles={{
              id: image.service.id,
              height: image.height as number,
              width: image.width as number,
              imageService: image.service as any,
              thumbnail: thumbnail && thumbnail.type === 'fixed' ? thumbnail : undefined,
            }}
            x={image.target?.spatial.x + x}
            y={image.target?.spatial.y + y}
            width={image.target?.spatial.width}
            height={image.target?.spatial.height}
            style={style}
            tileFormat={tileFormat}
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
                      target={image.target.spatial}
                      display={{ height, width }}
                    />
                  );
                }
                return null;
              })}
          </TileSet>
          {annotations}
        </Fragment>
      )}
    </React.Fragment>
  );
}

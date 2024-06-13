import { SingleImage, TileSet } from '../../atlas-components';
import React from 'preact/compat';
import { ImageWithOptionalService, useResourceEvents, useStyles } from 'react-iiif-vault';
import { ImageCandidate } from '@atlas-viewer/iiif-image-api';
import { SizeParameter } from '../../helpers/size-parameter';
import { getImageUrl } from '../../helpers/get-image-url';
import { Fragment } from 'preact/compat';
import { useMemo } from 'preact/compat';

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
  skipSizes,
  annotationId,
  skipThumbnail,
}: {
  id: string;
  image: ImageWithOptionalService;
  thumbnail?: ImageCandidate;
  isStatic?: boolean;
  virtualSizes?: SizeParameter[];
  x?: number;
  y?: number;
  annotations?: any;
  tileFormat?: string;
  skipSizes?: boolean;
  annotationId?: string;
  skipThumbnail?: boolean;
}) {
  // For image resources, we may not support everything.. but we do support opacity.
  const annotationStyles = useStyles(annotationId ? { id: annotationId, type: 'Annotation' } : undefined, 'atlas');
  const resourceStyle = useStyles({ id, type: 'ContentResource' }, 'atlas');
  const style = useMemo(() => ({ ...annotationStyles, ...resourceStyle }), [annotationStyles, resourceStyle]);
  const events = useResourceEvents(annotationId ? { id: annotationId, type: 'Annotation' } : undefined, ['atlas']);
  const resourceEvents = useResourceEvents({ id, type: 'ContentResource' }, ['atlas']);

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
            {...events}
            {...resourceEvents}
          />
          {annotations}
        </Fragment>
      ) : (
        <Fragment key="service">
          <TileSet
            viewport={isStatic}
            tiles={{
              id: image.service.id,
              height: (image.height !== image.service.height ? image.service.height : image.height) as number,
              width: (image.width !== image.service.width ? image.service.width : image.width) as number,
              imageService: image.service as any,
              thumbnail: !skipThumbnail && thumbnail && thumbnail.type === 'fixed' ? thumbnail : undefined,
            }}
            skipSizes={skipSizes}
            skipThumbnail={skipThumbnail}
            x={image.target?.spatial.x + x}
            y={image.target?.spatial.y + y}
            width={image.target?.spatial.width}
            height={image.target?.spatial.height}
            style={style}
            tileFormat={tileFormat}
            {...events}
            {...resourceEvents}
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

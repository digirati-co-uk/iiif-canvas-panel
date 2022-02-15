import { ImageService } from '@iiif/presentation-3';
import { SizeParameter, sizeParameterToString } from './size-parameter';
import { canonicalServiceUrl } from '@atlas-viewer/iiif-image-api';

export function getImageUrl(image: ImageService, size: SizeParameter) {
  const id = canonicalServiceUrl(image.id || image['@id'] || '').slice(0, -10);
  if (!id || size.percentScale || !size.width || size.confined || !image.height || !image.width) {
    return [null, { height: 0, width: 0 }] as const;
  }

  return [
    [
      id,
      'full',
      sizeParameterToString(size),
      '0',
      'default.jpg', // @todo preferred formats
    ].join('/'),
    // @todo MUCH better height/width
    {
      width: size.width || 1,
      height: size.confined
        ? (image.height / image.width) * size.width
        : size.height || (image.height / image.width) * size.width,
    },
  ] as const;
}

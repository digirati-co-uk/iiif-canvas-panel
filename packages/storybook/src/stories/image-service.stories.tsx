import React from 'react';

export default { title: 'Web components/Image service' };

const src = 'https://iiif.wellcomecollection.org/image/b18035723_0001.JP2';

// By default, the image service will expand to fill the container it is in, with a height of 512px.
export const RenderingSimpleImageService = () => (
  // @ts-ignore
  <image-service src={src} />
);

// You can set a custom height and width too.
export const CustomHeight = () => (
  // @ts-ignore
  <image-service width={512} height={256} src={src} />
);

// Your image service will be deep-zoomable by default also, but you can switch out to a static preset.
export const StaticPreset = () => (
  // @ts-ignore
  <image-service preset="static" width="512" height="256" src={src} />
);

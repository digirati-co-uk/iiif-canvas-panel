import { FC } from 'preact/compat';
import { useCanvas, useImageService } from '@hyperion-framework/react-vault';
import { h } from 'preact';
import { ImageService } from './atlas/image-service';

export const SingleImageService: FC = () => {
  const canvas = useCanvas();
  const imageService = useImageService();

  if (!canvas || !imageService.data) {
    return null;
  }

  return (
    <ImageService
      id={imageService.data.id}
      width={imageService.data.width || canvas.width}
      height={imageService.data.height || canvas.height}
    />
  );
};

import { createElement as h } from "react";
import { RenderImage as SharedImage } from "react-iiif-vault/canvas-panel/scene";
import type { ImageWithOptionalService } from "react-iiif-vault/core";
import type { ImageCandidate } from "@atlas-viewer/iiif-image-api";
import type { SizeParameter } from "../../helpers/size-parameter";
import { getImageUrl } from "../../helpers/get-image-url";

export function resolveImageCandidates(image: ImageWithOptionalService, sizes: SizeParameter[] = []) {
  if (!image.service) return [];
  return sizes.flatMap((size) => {
    const [id, dimensions] = getImageUrl(image.service!, size);
    return id ? [{ id, ...dimensions }] : [];
  });
}
export function RenderImage({
  image,
  virtualSizes,
  skipSizes,
  skipThumbnail,
  tileFormat,
  annotations,
  ...props
}: {
  id: string;
  image: ImageWithOptionalService;
  thumbnail?: ImageCandidate;
  isStatic?: boolean;
  virtualSizes?: SizeParameter[];
  x?: number;
  y?: number;
  rotation?: number;
  annotations?: any;
  tileFormat?: string;
  skipSizes?: boolean;
  annotationId?: string;
  skipThumbnail?: boolean;
  useFloorCalc?: boolean;
}) {
  return (
    <SharedImage
      {...props}
      image={image}
      thumbnail={props.thumbnail as any}
      selector={image.selector}
      enableSizes={!skipSizes}
      enableThumbnail={!skipThumbnail}
      imageCandidates={resolveImageCandidates(image, virtualSizes)}
      format={tileFormat}
    >
      {annotations}
    </SharedImage>
  );
}

import { Projection } from '@atlas-viewer/atlas';

export function targetToPixels(
  { unit, ...target }: Projection & { unit: 'percent' | 'pixel' },
  size: { height: number; width: number }
): Projection {
  if (unit === 'percent') {
    return {
      x: size.width * (target.x / 100),
      y: size.height * (target.y / 100),
      width: size.width * (target.width / 100),
      height: size.height * (target.height / 100),
    };
  }

  return target;
}

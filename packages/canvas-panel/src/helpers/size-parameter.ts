// Port of: https://github.com/digirati-co-uk/iiif-net/blob/main/src/IIIF/IIIF/ImageApi/SizeParameter.cs

export type SizeParameter = {
  height?: number;
  width?: number;
  max: boolean;
  upscaled: boolean;
  confined: boolean;
  percentScale?: number;
};

export function sizeParameterToString({ max, percentScale, upscaled, confined, width, height }: SizeParameter): string {
  const sb: string[] = [];

  if (upscaled) {
    sb.push('^');
  }

  if (max) {
    sb.push('max');
    return sb.join('');
  }

  if (confined) {
    sb.push('!');
  }

  if (percentScale) {
    sb.push(`pct:${percentScale}`);
  }

  if (width) {
    sb.push(`${width}`);
  }

  sb.push(',');

  if (height) {
    sb.push(`${height}`);
  }

  return sb.join('');
}

export function parseSize(pathPart: string): SizeParameter {
  const size: SizeParameter = {
    upscaled: false,
    max: false,
    confined: false,
  };

  if (pathPart[0] === '^') {
    size.upscaled = true;
    pathPart = pathPart.slice(1);
  }

  if (pathPart === 'max' || pathPart === 'full') {
    size.max = true;
  }

  if (pathPart[0] === '!') {
    size.confined = true;
    pathPart = pathPart.slice(1);
  }

  if (pathPart[0] === 'p') {
    size.percentScale = parseFloat(pathPart.slice(4));
    return size;
  }

  const wh = pathPart.split(',').map((t) => t.trim());
  if (wh[0] !== '') {
    size.width = parseInt(wh[0], 10);
  }

  if (wh[1] !== '') {
    size.height = parseInt(wh[1], 10);
  }

  return size;
}

import { useAnnotation } from 'react-iiif-vault';
import { BoxSelector } from '@iiif/vault-helpers/.build/types/annotation-targets/selector-types';
import { Fragment } from 'preact/compat';
import { h } from 'preact';

export function RenderTextFragment({
  annotationId,
  interactive,
  relative,
}: {
  annotationId: string;
  interactive?: boolean;
  relative?: boolean;
}) {
  const annotation = useAnnotation({ id: annotationId });
  const textStyle = { fill: 'rgba(0,0,0,0)' };
  const boxStyle = { fill: 'rgba(0,0,0,0)' };

  //
  if (!annotation?.motivation?.includes('supplementing') || !annotation.body) {
    return null;
  }

  const body = (Array.isArray(annotation.body) ? annotation.body : [annotation.body]).filter(
    (bodyItem) => (bodyItem as any).type === 'TextualBody'
  );

  const target = (annotation.target as any).selector as BoxSelector;

  if (!target) {
    return null;
  }

  return (
    <Fragment>
      <rect
        x={relative ? 0 : target.spatial.x}
        y={relative ? 0 : target.spatial.y}
        width={target.spatial.width}
        height={target.spatial.height}
        style={boxStyle}
      />
      <text
        x={relative ? 0 : target.spatial.x}
        y={(relative ? 0 : target.spatial.y) + target.spatial.height * 0.75}
        textLength={target.spatial.width}
        fontSize={`${target.spatial.height}px`}
        lengthAdjust="spacingAndGlyphs"
        className="text-line-segment"
        /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        part="text-line-segment"
        style={{ ...textStyle, pointerEvents: interactive ? 'initial' : undefined }}
      >
        {(body[0] as any).value || ''}
      </text>
    </Fragment>
  );
}

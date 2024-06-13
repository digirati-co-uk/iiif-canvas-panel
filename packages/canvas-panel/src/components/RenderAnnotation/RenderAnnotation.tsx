import { useAnnotation, useCanvas, useResourceEvents, useStyles } from 'react-iiif-vault';
import { FC, useMemo } from 'preact/compat';
import { RegionHighlight } from '../../atlas-components/RegionHighlight/RegionHighlight';
import { BoxStyle, mergeStyles } from '@atlas-viewer/atlas';
import { RenderTextualContent } from '../RenderTextLines/RenderTextualContent';
import { Shape } from '../../atlas-components';

const warnings = { targetWarning: false };

export const RenderAnnotation: FC<{
  id: string;
  className?: string;
  style?: BoxStyle;
  interactive?: boolean;
  textSelectionEnabled?: boolean;
}> = ({ id, style: defaultStyle, className, interactive, textSelectionEnabled }) => {
  const annotation = useAnnotation({ id });
  const style = useStyles<BoxStyle>(annotation, 'atlas');
  const html = useStyles<{ className?: string; href?: string; title?: string; target?: string }>(annotation, 'html');
  const events = useResourceEvents(annotation as any, ['atlas']);
  const canvas = useCanvas();

  const allStyles = useMemo(() => {
    return mergeStyles(defaultStyle, style);
  }, [defaultStyle, style]);

  const selector = (annotation?.target as any).selector;

  const isValid = canvas && annotation && annotation.target && selector;

  if (!isValid) {
    return null;
  }

  if (
    annotation &&
    canvas &&
    (annotation.target as any).source.id &&
    (annotation.target as any).source.id !== canvas.id
  ) {
    if (!warnings.targetWarning) {
      warnings.targetWarning = true;
      console.log('annotation target source id does not match canvas id', {
        annotationId: annotation.id,
        canvasId: canvas.id,
        annotationTargetSourceId: (annotation.target as any).source.id,
      });
    }
  }

  if (selector && selector.type === 'SvgSelector' && selector.points) {
    return (
      <Shape
        points={selector.points.map((p: any) => [p[0], p[1]])}
        open={selector.svgShape === 'polyline'}
        relativeStyle={true}
        interactive={!!(html?.href || interactive)}
        style={allStyles}
        target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}
        {...events}
      />
    );
  }

  const isBoxValid =
    (annotation.target as any).selector &&
    (annotation.target as any).selector.type === 'BoxSelector' &&
    (annotation.target as any).source;

  if (!isBoxValid) {
    return null;
  }

  return (
    <RegionHighlight
      id={annotation.id}
      isEditing={true}
      region={(annotation.target as any).selector.spatial}
      style={allStyles}
      className={html?.className || className}
      interactive={!!(html?.href || interactive)}
      href={html?.href || null}
      title={html?.title || null}
      hrefTarget={html?.target || null}
      {...events}
    >
      <RenderTextualContent annotation={annotation as any} textSelectionEnabled={textSelectionEnabled} />
    </RegionHighlight>
  );
};

import { useAnnotation, useCanvas, useResourceEvents, useStyles, useVault, VaultProvider } from 'react-iiif-vault';
import { FC, useMemo } from 'preact/compat';
import { h } from 'preact';
import { RegionHighlight } from '../../atlas-components/RegionHighlight/RegionHighlight';
import { BoxStyle, mergeStyles } from '@atlas-viewer/atlas';
import { RenderTextualContent } from '../RenderTextLines/RenderTextualContent';
import { HTMLPortal } from '../../atlas-components/HTMLPortal';

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

  const isValid =
    canvas &&
    annotation &&
    annotation.target &&
    (annotation.target as any).selector &&
    (annotation.target as any).selector.type === 'BoxSelector' &&
    (annotation.target as any).source &&
    (annotation.target as any).source.id === canvas.id;

  if (!isValid) {
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

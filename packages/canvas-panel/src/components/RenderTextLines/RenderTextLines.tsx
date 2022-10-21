import { useAnnotationPage, useCanvas, useStyles, useVault, VaultProvider } from 'react-iiif-vault';
import { h } from 'preact';
import { BoxStyle } from '@atlas-viewer/atlas';
import { HTMLPortal } from '../../atlas-components/HTMLPortal';
import { WorldObject } from '../../atlas-components';
import { RenderTextFragment } from './RenderTextFragment';

export function RenderTextLines({
  annotationPageId,
  selectionEnabled,
}: {
  annotationPageId: string;
  selectionEnabled?: boolean;
}) {
  const page = useAnnotationPage({ id: annotationPageId });
  const canvas = useCanvas();
  const vault = useVault();
  const svgStyle = useStyles<BoxStyle>(page, 'text-lines');

  if (!page || !page.items || !canvas) {
    return null;
  }

  return (
    <WorldObject {...{ x: 0, y: 0, width: canvas.width, height: canvas.height }}>
      <HTMLPortal target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}>
        <VaultProvider vault={vault}>
          <svg
            /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            tabindex={0}
            aria-name=""
            aria-live="off"
            aria-atomic="true"
            aria-relevant="all"
            aria-expanded="true"
            role="article"
            style={{ ...svgStyle, userSelect: 'text' } as any}
            width={canvas.width}
            height={canvas.height}
          >
            {page.items.map((annotation) => {
              return (
                <RenderTextFragment
                  key={`line-${annotation.id}`}
                  annotationId={annotation.id}
                  interactive={selectionEnabled}
                />
              );
            })}
          </svg>
        </VaultProvider>
      </HTMLPortal>
    </WorldObject>
  );
}

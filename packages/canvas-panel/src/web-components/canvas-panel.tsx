import { h } from 'preact';
import { ManifestLoader } from '../components/manifest-loader';
import { FC } from 'preact/compat';
import register from 'preact-custom-element';
import { NestedVault } from '../components/nested-vault';
import { CanvasContext } from '@hyperion-framework/react-vault';
import { SingleImageService } from '../components/single-image-service';
import { Atlas } from '../../../../../../atlas-viewer/atlas';

export type CanvasPanelProps = {
  manifestId: string;
  canvasId: string;

  height?: number | string;
  width?: number | string;
};

export const CanvasPanel: FC<CanvasPanelProps> = ({ manifestId, canvasId, height, width }) => {
  if (!manifestId) {
    return <div>Error: no manifest URI</div>;
  }

  return (
    <NestedVault>
      <ManifestLoader manifestId={manifestId}>
        <CanvasContext canvas={canvasId}>
          <Atlas width={width ? Number(width) : 512} height={height ? Number(height) : 512} unstable_noReconciler>
            <SingleImageService />
          </Atlas>
        </CanvasContext>
      </ManifestLoader>
    </NestedVault>
  );
};

register(CanvasPanel, 'canvas-panel', ['manifest-id', 'canvas-id', 'width', 'height'], { shadow: true });

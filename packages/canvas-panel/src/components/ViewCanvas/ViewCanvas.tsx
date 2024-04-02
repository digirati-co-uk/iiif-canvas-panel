import { h } from 'preact';
import { ErrorBoundary as _ErrorBoundary } from 'react-error-boundary';
import { ViewCanvasProps } from './ViewCanvas.types';
import { AtlasCanvas } from '../AtlasCanvas/AtlasCanvas';
import { NestedAtlas } from '../NestedAtlas/NestedAtlas';
import {
  useCanvas,
  useResourceContext,
  useVaultSelector,
  useAnnotationPageManager,
  useManifest,
  useVault,
} from 'react-iiif-vault';
import { useRegisterPublicApi } from '../../hooks/use-register-public-api';
import { useLayoutEffect, useMemo, useRef, useState } from 'preact/compat';
import { serialiseContentState } from '../../helpers/content-state/content-state';
import { ErrorFallback } from '../ErrorFallback/ErrorFallback';
import { targetToPixels } from '../../helpers/target-to-pixels';
import { RenderAllCanvases } from '../RenderAllCanvases';

const ErrorBoundary = _ErrorBoundary as any;

export function ViewCanvas(props: ViewCanvasProps) {
  const vault = useVault();
  const ctx = useResourceContext();
  const canvas = useCanvas();
  const manifest = useManifest();
  const manager = useAnnotationPageManager(manifest?.id || canvas?.id);
  const [annoMode, setAnnoMode] = useState(false);
  const aspectRatio =
    !props.displayOptions.viewport && canvas
      ? props.displayOptions.homePosition
        ? props.displayOptions.homePosition.width / props.displayOptions.homePosition.height
        : canvas.width / canvas.height
      : undefined;

  useRegisterPublicApi((el) => {
    if (!manager) {
      return {};
    }

    if (!(el as any).annotationPageManager) {
      (el as any).annotationPageManager = {};
    }

    // Update?
    (el as any).annotationPageManager.availablePageIds = manager.availablePageIds;
    (el as any).annotationPageManager.enabledPageIds = manager.enabledPageIds;
    (el as any).annotationPageManager.setPageEnabled = manager.setPageEnabled;
    (el as any).annotationPageManager.setPageDisabled = manager.setPageDisabled;
    return {};
  }, [manager.availablePageIds, manager.enabledPageIds, manager.setPageEnabled, manager.setPageDisabled].join('/'));

  useLayoutEffect(() => {
    if (props.followAnnotations === false) {
      return;
    }
    manager.availablePageIds.map((pageId) => {
      if (!vault.requestStatus(pageId)) {
        vault.load(pageId);
      }
    });
  }, [manager.availablePageIds, props.followAnnotations]);

  useVaultSelector((state) => (ctx.canvas ? state.iiif.entities.Canvas[ctx.canvas] : null), []);

  const [displayOptions, containerProps] = useMemo(() => {
    const { width, height, homePosition: _, containerProps, ...rest } = props.displayOptions;
    const homePosition =
      props.displayOptions.homePosition && canvas
        ? targetToPixels(props.displayOptions.homePosition as any, canvas)
        : null;

    if (homePosition) {
      (rest as any).homePosition = homePosition;
    }

    if (width) {
      (rest as any).width = width;
    }

    if (height) {
      (rest as any).height = height;
    }

    return [rest as typeof props.displayOptions, containerProps];
  }, [props.displayOptions, canvas]);

  const onKeyDownContainer = (e: any) => {
    if (e.altKey && e.code === 'KeyB') {
      setAnnoMode(true);
    }
  };

  const Component = props.renderMultiple ? RenderAllCanvases : AtlasCanvas;

  // To centre: containerStyle={{ margin: '0 auto' }}
  return (
    <ErrorBoundary
      fallbackRender={(props: any) => (
        <ErrorFallback
          height={displayOptions.height}
          width={displayOptions.width}
          aspectRatio={aspectRatio}
          {...props}
        />
      )}
    >
      <NestedAtlas
        key={props.renderMultiple ? '' : canvas?.id}
        aspectRatio={aspectRatio}
        containerProps={{
          onKeyDown: onKeyDownContainer,
          ...(containerProps || {}),
        }}
        className={props.className}
        {...displayOptions}
        mode={annoMode ? 'sketch' : props.mode}
        homeCover={props.homeCover}
        homeOnResize={!!props.homeCover}
      >
        <Component
          isStatic={!props.interactive}
          debug={props.debug}
          virtualSizes={props.virtualSizes}
          highlight={props.highlight}
          highlightCssClass={props.highlightCssClass}
          annoMode={annoMode}
          defaultChoices={props.defaultChoices}
          disableThumbnail={props.disableThumbnail}
          skipSizes={props.skipSizes}
          onCreated={(e: any) => {
            if (manifest && canvas && e) {
              navigator.clipboard.writeText(
                serialiseContentState({
                  id: `${canvas.id}#xywh=${e.x},${e.y},${e.width},${e.height}`,
                  type: 'Canvas',
                  partOf: [{ id: manifest.id, type: 'Manifest' }],
                })
              );
            }
            setAnnoMode(false);
          }}
          x={props.x}
          y={props.y}
          textSelectionEnabled={props.textSelectionEnabled}
          textEnabled={props.textEnabled}
          margin={props.margin}
        />

        {props.children}
      </NestedAtlas>
    </ErrorBoundary>
  );
}

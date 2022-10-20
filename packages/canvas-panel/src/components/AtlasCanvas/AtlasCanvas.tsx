import React, { FC, useEffect, useLayoutEffect, useMemo } from 'preact/compat';
import {
  useCanvas,
  useResourceEvents,
  useRenderingStrategy,
  useThumbnail,
  StrategyActions,
  useVault,
  ChoiceDescription,
  useVaultSelector,
  useAnnotationPageManager,
  useManifest,
} from 'react-iiif-vault';
import { createStylesHelper } from '@iiif/vault-helpers';
import { Fragment, h } from 'preact';
import { WorldObject, SingleImage } from '../../atlas-components';
import { RenderAnnotationPage } from '../RenderAnnotationPage/RenderAnnotationPage';
import { RegionHighlight } from '../../atlas-components/RegionHighlight/RegionHighlight';
import { SizeParameter } from '../../helpers/size-parameter';
import { Debug } from '../../hooks/debug';
import { DrawBox } from '@atlas-viewer/atlas';
import { RenderImage } from '../RenderImage/RenderImage';
import { useVirtualAnnotationPageContext } from '../../hooks/use-virtual-annotation-page-context';
import { RenderAudio } from '../RenderAudio/RenderAudio';
import { RenderVideo } from '../RenderVideo/RenderVideo';
import { RenderTextLines } from '../RenderTextLines/RenderTextLines';
import { sortAnnotationPages } from '../../helpers/sort-annotation-pages';

interface AtlasCanvasProps {
  x?: number;
  y?: number;
  highlight?: any | undefined;
  virtualSizes: SizeParameter[];
  highlightCssClass?: string;
  debug?: boolean;
  annoMode?: boolean;
  onChoiceChange?: (choice?: ChoiceDescription) => void;
  defaultChoices?: Array<{ id: string; opacity?: number }>;
  onCreated?: any;
  registerActions?: (actions: StrategyActions) => void;
  isStatic?: boolean;
  textSelectionEnabled?: boolean;
  children?: any;
  textEnabled?: boolean;
}

export function AtlasCanvas({
  x,
  y,
  highlight,
  annoMode,
  onCreated,
  debug,
  virtualSizes,
  onChoiceChange,
  highlightCssClass,
  registerActions,
  defaultChoices,
  isStatic,
  textSelectionEnabled,
  textEnabled,
}: AtlasCanvasProps) {
  const manifest = useManifest();
  const canvas = useCanvas();
  const elementProps = useResourceEvents(canvas, ['deep-zoom']);
  const [virtualPage] = useVirtualAnnotationPageContext();
  const vault = useVault();
  const helper = useMemo(() => createStylesHelper(vault as any), [vault]);
  const [strategy, actions] = useRenderingStrategy({
    strategies: ['images', 'media'],
    defaultChoices: defaultChoices?.map(({ id }) => id),
  });
  const choice = strategy.type === 'images' ? strategy.choice : undefined;
  const manager = useAnnotationPageManager(manifest?.id || canvas?.id);
  const fullPages = useVaultSelector(
    (state, vault) => {
      return manager.availablePageIds.map((i) => vault.get(i));
    },
    [...manager.availablePageIds]
  );
  const pageTypes = useMemo(() => sortAnnotationPages(manager.availablePageIds, vault as any), fullPages);
  const hasTextLines = !!pageTypes.pageMapping.supplementing?.length;
  const firstTextLines = hasTextLines ? pageTypes.pageMapping.supplementing[0] : null;

  useEffect(() => {
    if (registerActions) {
      registerActions(actions);
    }
  }, [strategy.annotations]);

  useEffect(() => {
    if (textEnabled) {
      const promises = [];
      for (const page of manager.availablePageIds) {
        if (!vault.requestStatus(page)) {
          promises.push(vault.load(page));
        }
      }
    }
  }, [canvas?.id, textEnabled]);

  useEffect(() => {
    if (defaultChoices) {
      for (const choice of defaultChoices) {
        if (typeof choice.opacity !== 'undefined') {
          helper.applyStyles({ id: choice.id }, 'atlas', {
            opacity: choice.opacity,
          });
        }
      }
    }
  }, [defaultChoices]);

  useLayoutEffect(() => {
    if (onChoiceChange) {
      onChoiceChange(choice);
    }
  }, [choice]);

  const thumbnail = useThumbnail({ maxWidth: 256, maxHeight: 256 });

  if (!canvas) {
    return null;
  }

  if (strategy.type === 'media') {
    if (strategy.media.type !== 'Sound' && strategy.media.type !== 'Video') {
      throw new Error('Unknown media type');
    }

    return (
      <WorldObject
        key={strategy.type}
        height={canvas.height || 1000}
        width={canvas.width || 1000}
        x={x}
        y={y}
        {...elementProps}
      >
        {strategy.media.type === 'Sound' ? <RenderAudio media={strategy.media} /> : null}
        {strategy.media.type === 'Video' ? <RenderVideo media={strategy.media} /> : null}
      </WorldObject>
    );
  }

  if (strategy.type === 'unknown') {
    if (thumbnail && thumbnail.type === 'fixed') {
      return (
        <WorldObject height={canvas.height} width={canvas.width} x={x} y={y}>
          <SingleImage
            uri={thumbnail.id}
            target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}
            display={
              thumbnail.width && thumbnail.height
                ? ({
                    width: thumbnail.width,
                    height: thumbnail.height,
                  } as any)
                : undefined
            }
          />
        </WorldObject>
      );
    }

    throw new Error('Unknown image strategy');
  }

  const annotations = (
    <Fragment>
      {annoMode ? (
        <DrawBox
          onCreate={(e: any) => {
            if (onCreated) {
              onCreated(e);
            }
          }}
        />
      ) : null}
      {highlight && highlight.selector && highlight.selector.type === 'BoxSelector' ? (
        <RegionHighlight
          id="highlight"
          isEditing={true}
          onClick={() => {
            // no-op
          }}
          onSave={() => {
            // no-op
          }}
          region={highlight.selector.spatial as any}
          style={highlightCssClass ? undefined : { border: '3px solid red' }}
          className={highlightCssClass}
        />
      ) : null}
      {virtualPage ? <RenderAnnotationPage page={virtualPage} textSelectionEnabled={textSelectionEnabled} /> : null}
      {strategy.annotations && strategy.annotations.pages
        ? strategy.annotations.pages.map((page) => {
            return <RenderAnnotationPage key={page.id} page={page} textSelectionEnabled={textSelectionEnabled} />;
          })
        : null}
      {debug ? <Debug /> : null}
      {textEnabled && firstTextLines ? (
        <RenderTextLines annotationPageId={firstTextLines} selectionEnabled={textSelectionEnabled} />
      ) : null}
    </Fragment>
  );

  return (
    <WorldObject key={strategy.type} height={canvas.height} width={canvas.width} x={x} y={y} {...elementProps}>
      {strategy.type === 'images'
        ? strategy.images.map((image, idx) => {
            return (
              <RenderImage
                isStatic={isStatic}
                key={image.id}
                image={image}
                id={image.id}
                thumbnail={idx === 0 ? (thumbnail as any) : undefined}
                virtualSizes={virtualSizes}
                annotations={annotations}
              />
            );
          })
        : null}
      {/* This is required to fix a race condition. */}
    </WorldObject>
  );
}

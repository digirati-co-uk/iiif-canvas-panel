import React, { FC, useEffect, useLayoutEffect, useMemo } from 'preact/compat';
import {
  useCanvas,
  useResources,
  parseSpecificResource,
  useResourceEvents,
  useRenderingStrategy,
  useThumbnail,
  useVault,
  useVaultSelector,
  useAnnotationPageManager,
  useManifest,
} from 'react-iiif-vault';
import { createStylesHelper, SingleChoice, createPaintingAnnotationsHelper } from '@iiif/vault-helpers';
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
import { choiceEventChannel } from '../../helpers/eventbus';
import { AnnotationPageNormalized, ContentResource } from '@iiif/presentation-3';

interface AtlasCanvasProps {
  x?: number;
  y?: number;
  highlight?: any | undefined;
  virtualSizes: SizeParameter[];
  highlightCssClass?: string;
  debug?: boolean;
  annoMode?: boolean;
  defaultChoices?: Array<{ id: string; opacity?: number }>;
  onCreated?: any;
  isStatic?: boolean;
  textSelectionEnabled?: boolean;
  children?: any;
  margin?: number;
  textEnabled?: boolean;
  disableThumbnail?: boolean;
  skipSizes?: boolean;
}

export function AtlasCanvas({
  x,
  y,
  highlight,
  annoMode,
  onCreated,
  debug,
  virtualSizes,
  highlightCssClass,
  defaultChoices,
  isStatic,
  textSelectionEnabled,
  textEnabled,
  disableThumbnail,
  skipSizes,
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

  const manager = useAnnotationPageManager(manifest?.id || canvas?.id);
  const fullPages = useVaultSelector(
    (state, vault) => {
      return manager.availablePageIds.map((i) => vault.get(i));
    },
    [...manager.availablePageIds]
  );

  useEffect(() => {
    // this is all hoisted from https://github.com/IIIF-Commons/iiif-helpers/blob/0f582fbcf4a8899258b7a71d2216ffeb56275de4/src/painting-annotations/helper.ts#L38
    // BUT... it doesn't work there because it assumes there's a single choice per page
    const vaulthelper = createPaintingAnnotationsHelper(vault);
    // get all painting annotations for a canvas
    if (canvas?.id) {
      const enabledChoices = defaultChoices?.map(({ id }) => id) || [];
      const vaultAnnotations = vaulthelper.getAllPaintingAnnotations(canvas.id);
      // Extract choices (if any) from a canvas

      for (const annotation of vaultAnnotations) {
        if (annotation.type !== 'Annotation') {
          throw new Error(`getPaintables() accept either a canvas or list of annotations`);
        }

        const references = Array.from(Array.isArray(annotation.body) ? annotation.body : [annotation.body]);
        for (const reference of references) {
          const [ref, { selector }] = parseSpecificResource(reference as any);
          const body = vault.get(ref) as any;
          const type = (body.type || 'unknown').toLowerCase();
          // Choice
          if (type !== 'choice') {
            continue;
          }
          const nestedBodies = vault.get(body.items) as ContentResource[];

          // if the enabledChoices has the id, then turn it on, otherwise choose the 1st item
          const selected = enabledChoices.length
            ? enabledChoices.map((cid) => nestedBodies.find((b) => b.id === cid)).filter(Boolean)
            : [nestedBodies[0]];

          if (selected.length === 0) {
            selected.push(nestedBodies[0]);
          }
          const choice: SingleChoice = {
            type: 'single-choice',
            items: nestedBodies.map((b) => ({
              id: b.id,
              label: (b as any).label as any,
              selected: selected.indexOf(b) !== -1,
            })) as any[],
            label: (ref as any).label,
          };
          choiceEventChannel.emit('onChoiceChange', {
            choice,
            partOf: {
              canvasId: canvas.id,
              choiceId: body.id,
              manifestId: manifest?.id,
            },
          });
        }
      }
      // this returns 1 choice
      const choices = vaulthelper.extractChoices(canvas.id);
    }
  }, [canvas?.id, actions, defaultChoices]);

  const pageTypes = useMemo(() => sortAnnotationPages(manager.availablePageIds, vault as any), fullPages);
  const hasTextLines = !!pageTypes.pageMapping.supplementing?.length;
  const firstTextLines = hasTextLines ? pageTypes.pageMapping.supplementing[0] : null;

  useEffect(() => {
    const unsubscribeOnMakeChoice = choiceEventChannel.on('onMakeChoice', (payload: { id: any; options: any }) => {
      actions.makeChoice(payload.id, payload.options);
    });
    return () => {
      unsubscribeOnMakeChoice();
    };
  }, [actions]);

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
                annotationId={image.annotationId}
                thumbnail={idx === 0 && !disableThumbnail ? (thumbnail as any) : undefined}
                virtualSizes={virtualSizes}
                annotations={annotations}
                skipSizes={skipSizes}
                skipThumbnail={disableThumbnail}
              />
            );
          })
        : null}
      {/* This is required to fix a race condition. */}
    </WorldObject>
  );
}

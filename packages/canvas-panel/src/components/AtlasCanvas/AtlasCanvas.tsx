import { useEffect, useMemo } from 'react';
import {
  useCanvas,
  parseSpecificResource,
  useVault,
  useVaultSelector,
  useAnnotationPageManager,
  useManifest,
} from 'react-iiif-vault/core';
import { SingleChoice, createPaintingAnnotationsHelper } from '@iiif/helpers';
import { Fragment, createElement as h } from 'react';
import { RenderAnnotationPage } from '../RenderAnnotationPage/RenderAnnotationPage';
import { RegionHighlight } from '../../atlas-components/RegionHighlight/RegionHighlight';
import { SizeParameter } from '../../helpers/size-parameter';
import { Debug } from '../../hooks/debug';
import { DrawBox } from '../../atlas-components/DrawBox';
import {
  CanvasStrategyProvider,
  CanvasWorldObject,
  RenderCanvasScene,
  useStrategy,
} from 'react-iiif-vault/canvas-panel/scene';
import { SceneMedia, SceneUnsupported } from './presentation';
import { RenderImage } from '../RenderImage/RenderImage';
import { useVirtualAnnotationPageContext } from '../../hooks/use-virtual-annotation-page-context';
import { RenderTextLines } from '../RenderTextLines/RenderTextLines';
import { sortAnnotationPages } from '../../helpers/sort-annotation-pages';
import { useChoiceEventChannel } from '../../helpers/eventbus';
import type { ContentResource } from '@iiif/parser/presentation-3/types';

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
  rotation?: number;
  useFloorCalc?: boolean;
}

export function AtlasCanvas(props: AtlasCanvasProps) {
  const manifest = useManifest();
  const canvas = useCanvas();
  return (
    <CanvasStrategyProvider
      strategies={['images', 'media']}
      defaultChoices={props.defaultChoices}
      annotationPageManagerId={manifest?.id || canvas?.id}
    >
      <AtlasCanvasContent {...props} />
    </CanvasStrategyProvider>
  );
}
function AtlasCanvasContent({
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
  rotation,
  useFloorCalc,
}: AtlasCanvasProps) {
  const choiceEventChannel = useChoiceEventChannel();
  const manifest = useManifest();
  const canvas = useCanvas();
  const [virtualPage] = useVirtualAnnotationPageContext();
  const vault = useVault();
  const { strategy, actions } = useStrategy();

  const manager = useAnnotationPageManager(manifest?.id || canvas?.id);
  const fullPages = useVaultSelector(
    (state, vault) => {
      return manager.availablePageIds.map((i) => vault.get(i));
    },
    [...manager.availablePageIds],
  );

  useEffect(() => {
    // this is all hoisted from https://github.com/IIIF-Commons/iiif-helpers/blob/0f582fbcf4a8899258b7a71d2216ffeb56275de4/src/painting-annotations/helper.ts#L38
    // BUT... it doesn't work there because it assumes there's a single choice per page
    const vaulthelper = createPaintingAnnotationsHelper(vault);
    // get all painting annotations for a canvas
    if (canvas?.id) {
      // Report the current selection, not only the initial choice-id attribute.
      const enabledChoices =
        strategy.type === 'images'
          ? strategy.images.map((image) => image.id)
          : defaultChoices?.map(({ id }) => id) || [];
      const vaultAnnotations = vaulthelper.getAllPaintingAnnotations(canvas.id);
      // Extract choices (if any) from a canvas

      for (const annotation of vaultAnnotations) {
        if (annotation.type !== 'Annotation') {
          throw new Error(
            `getPaintables() accept either a canvas or list of annotations`,
          );
        }

        const references = Array.from(
          Array.isArray(annotation.body) ? annotation.body : [annotation.body],
        );
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
            ? enabledChoices
                .map((cid) => nestedBodies.find((b) => b.id === cid))
                .filter(Boolean)
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
    }
  }, [canvas?.id, strategy, defaultChoices]);

  const pageTypes = useMemo(
    () => sortAnnotationPages(manager.availablePageIds, vault as any),
    fullPages,
  );
  const hasTextLines = !!pageTypes.pageMapping.supplementing?.length;
  const firstTextLines = hasTextLines
    ? pageTypes.pageMapping.supplementing[0]
    : null;

  useEffect(() => {
    const unsubscribeOnMakeChoice = choiceEventChannel.on(
      'onMakeChoice',
      (payload: { id: any; options: any }) => {
        actions?.makeChoice(payload.id, payload.options);
      },
    );
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

  if (!canvas) {
    return null;
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
      {highlight &&
      highlight.selector &&
      highlight.selector.type === 'BoxSelector' ? (
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
      {virtualPage ? (
        <RenderAnnotationPage
          page={virtualPage}
          textSelectionEnabled={textSelectionEnabled}
        />
      ) : null}
      {strategy.annotations && strategy.annotations.pages
        ? strategy.annotations.pages.map((page) => {
            return (
              <RenderAnnotationPage
                key={page.id}
                page={page}
                textSelectionEnabled={textSelectionEnabled}
              />
            );
          })
        : null}
      {debug ? <Debug /> : null}
      {textEnabled && firstTextLines ? (
        <RenderTextLines
          annotationPageId={firstTextLines}
          selectionEnabled={textSelectionEnabled}
        />
      ) : null}
    </Fragment>
  );
  // The shared scene takes one candidate list. Legacy virtual sizes must be
  // resolved per image service, so compose the same shared image nodes here.
  if (
    strategy.type === 'images' &&
    (virtualSizes.length || (rotation && strategy.images.length > 1))
  ) {
    return (
      <CanvasWorldObject x={x} y={y}>
        {strategy.images.map((image) => (
          <RenderImage
            key={image.id}
            id={image.id}
            image={image}
            virtualSizes={virtualSizes}
            skipSizes={skipSizes}
            skipThumbnail={disableThumbnail}
            isStatic={isStatic}
            rotation={rotation}
            useFloorCalc={useFloorCalc}
          />
        ))}
        {annotations}
      </CanvasWorldObject>
    );
  }
  return (
    <RenderCanvasScene
      x={x}
      y={y}
      isStatic={isStatic}
      rotation={rotation}
      enableSizes={!skipSizes}
      enableThumbnail={!disableThumbnail}
      enableAnnotations={false}
      useFloorCalc={useFloorCalc}
      presentation={{
        Media: SceneMedia,
        Unsupported: SceneUnsupported,
        AnnotationPage: IgnoreAnnotationPage,
      }}
    >
      {strategy.type === 'images' ? annotations : null}
    </RenderCanvasScene>
  );
}
function IgnoreAnnotationPage() {
  return null;
}

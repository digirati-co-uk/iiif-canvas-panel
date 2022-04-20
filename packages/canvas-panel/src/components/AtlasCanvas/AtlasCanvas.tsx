import React, { FC, useEffect, useLayoutEffect, useMemo } from 'preact/compat';
import {
  useCanvas,
  useResourceEvents,
  useRenderingStrategy,
  useThumbnail,
  ParsedSelector,
  StrategyActions,
  useVault,
  ChoiceDescription,
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

export const AtlasCanvas: FC<{
  x?: number;
  y?: number;
  highlight?: ParsedSelector | undefined;
  virtualSizes: SizeParameter[];
  highlightCssClass?: string;
  debug?: boolean;
  annoMode?: boolean;
  onChoiceChange?: (choice?: ChoiceDescription) => void;
  defaultChoices?: Array<{ id: string; opacity?: number }>;
  onCreated?: any;
  registerActions?: (actions: StrategyActions) => void;
  isStatic?: boolean;
}> = ({
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
}) => {
  const canvas = useCanvas();
  const elementProps = useResourceEvents(canvas, ['deep-zoom']);
  const [virtualPage] = useVirtualAnnotationPageContext();
  const vault = useVault();
  const helper = useMemo(() => createStylesHelper(vault), [vault]);
  const [strategy, actions] = useRenderingStrategy({
    strategies: ['images'],
    defaultChoices: defaultChoices?.map(({ id }) => id),
  });
  const choice = strategy.type === 'images' ? strategy.choice : undefined;

  useEffect(() => {
    if (registerActions) {
      registerActions(actions);
    }
  }, [strategy.annotations]);

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

  if (strategy.type === 'unknown') {
    if (thumbnail && thumbnail.type === 'fixed') {
      return (
        <WorldObject height={canvas.height} width={canvas.width} x={x} y={y}>
          <SingleImage
            uri={thumbnail.id}
            target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}
            display={
              thumbnail.width && thumbnail.height
                ? {
                    width: thumbnail.width,
                    height: thumbnail.height,
                  }
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
      {virtualPage ? <RenderAnnotationPage page={virtualPage} /> : null}
      {strategy.annotations && strategy.annotations.pages
        ? strategy.annotations.pages.map((page) => {
            return <RenderAnnotationPage key={page.id} page={page} />;
          })
        : null}
      {debug ? <Debug /> : null}
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
                thumbnail={idx === 0 ? thumbnail : undefined}
                virtualSizes={virtualSizes}
                annotations={annotations}
              />
            );
          })
        : null}
      {/* This is required to fix a race condition. */}
    </WorldObject>
  );
};

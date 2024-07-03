import { h } from 'preact';
import { FC, useCallback, useEffect, useLayoutEffect, useRef } from 'preact/compat';
import register from '../library/preact-custom-element';
import { CanvasContext, VaultProvider } from 'react-iiif-vault';
import { RegisterPublicApi, UseRegisterPublicApi } from '../hooks/use-register-public-api';
import { ViewCanvas } from '../components/ViewCanvas/ViewCanvas';
import { ManifestLoader } from '../components/manifest-loader';
import { parseBool, parseChoices, parseContentStateParameter } from '../helpers/parse-attributes';
import { normaliseAxis, parseContentState, serialiseContentState } from '../helpers/content-state/content-state';
import { normaliseContentState } from '../helpers/content-state/content-state';
import { GenericAtlasComponent } from '../types/generic-atlas-component';
import { useGenericAtlasProps } from '../hooks/use-generic-atlas-props';
import { useState } from 'preact/compat';
import { ErrorFallback } from '../components/ErrorFallback/ErrorFallback';
import { VirtualAnnotationProvider } from '../hooks/use-virtual-annotation-page-context';
import { ContentStateCallback, ContentStateEvent } from '../types/content-state';
import { DrawBox, easingFunctions, Projection } from '@atlas-viewer/atlas';
import { ContentState } from '@iiif/vault-helpers';
import { baseAttributes } from '../helpers/base-attributes';
import { choiceEventChannel } from '../helpers/eventbus';

export type CanvasPanelProps = GenericAtlasComponent<
  {
    manifestId: string;
    canvasId?: string;
    choiceId?: string | string[];
    textSelectionEnabled?: 'true' | 'false' | boolean;
    disableThumbnail?: 'true' | 'false' | boolean;
    skipSizes?: 'true' | 'false' | boolean;
    textEnabled?: 'true' | 'false' | boolean;
    followAnnotations?: boolean;
    iiifContent?: string;
  },
  UseRegisterPublicApi['properties']
>;

const canvasPanelAttributes = [
  ...baseAttributes,
  'manifest-id',
  'canvas-id',
  'choice-id',
  'text-selection-enabled',
  'disable-thumbnail',
  'text-enabled',
  'follow-annotations',
  'iiif-content',
  'home-cover',
];

export const CanvasPanel: FC<CanvasPanelProps> = (props) => {
  const {
    vault,
    webComponent,
    runtime,
    atlasProps,
    isConfigBlocking,
    setParsedTarget,
    highlight,
    highlightCssClass,
    preferredFormats,
    virtualSizes,
    viewport,
    debug,
    mode,
    interactive,
    x,
    y,
    homeCover,
    className,
    inlineStyles,
    inlineStyleSheet,
    useProp,
    useRegisterWebComponentApi,
    setMode,
  } = useGenericAtlasProps(props);
  const [contentStateCallback, setContentStateCallback] = useState<ContentStateCallback | undefined>(undefined);
  const contentStateStack = useRef<ContentStateEvent[]>([]);
  const [error, setError] = useState<Error | null>();
  const [unknownContentState, , setParsedContentState] = useProp('iiifContent', {
    parse: parseContentStateParameter,
  });
  const [canvasId, setCanvasId, , canvasIdRef] = useProp('canvasId');
  const [manifestId, setManifestId, , manifestIdRef] = useProp('manifestId');
  const [followAnnotations] = useProp('followAnnotations', { parse: parseBool, defaultValue: true });
  const [defaultChoices, , , defaultChoiceIdsRef] = useProp('choiceId', { parse: parseChoices });
  const [textSelectionEnabled] = useProp('textSelectionEnabled', { parse: parseBool, defaultValue: true });
  const [disableThumbnail] = useProp('disableThumbnail', { parse: parseBool, defaultValue: false });
  const [skipSizes] = useProp('skipSizes', { parse: parseBool, defaultValue: false });
  const [textEnabled] = useProp('textEnabled', { parse: parseBool, defaultValue: false });
  const contentState =
    unknownContentState && unknownContentState.type !== 'remote-content-state' ? unknownContentState : null;
  const contentStateToLoad =
    unknownContentState && unknownContentState.type === 'remote-content-state' ? unknownContentState.id : null;

  const onCanvasChange = useCallback((canvas: string | undefined) => {
    if (webComponent.current) {
      choiceEventChannel.emit('onResetSeen');
      webComponent.current.dispatchEvent(new CustomEvent('canvas-change', { detail: { canvas } }));
    }
  }, []);
  const onDrawBox = useCallback(
    (e: Projection) => {
      if (contentStateCallback) {
        const contentState: ContentState = {
          id: `${canvasId}#xywh=${normaliseAxis(e.x)},${normaliseAxis(e.y)},${e.width},${e.height}`,
          type: 'Canvas',
          partOf: [{ id: manifestId, type: 'Manifest' }],
        };
        const event: ContentStateEvent = {
          contentState,
          normalisedContentState: normaliseContentState(contentState),
          encodedContentState: serialiseContentState(contentState),
          selection: {
            type: 'BoxSelector',
            spatial: e,
          },
        };

        contentStateStack.current.push(event);
        contentStateCallback(event);
      }
    },
    [contentStateCallback, manifestId, canvasId]
  );

  useRegisterWebComponentApi((htmlComponent: HTMLElement) => {
    return {
      vault,

      setCanvas: (id: string) => {
        htmlComponent.setAttribute('canvas-id', id);
      },
      setManifest: (id: string) => {
        htmlComponent.setAttribute('manifest-id', id);
      },

      setDefaultChoiceIds: (choiceIds: string[]) => {
        htmlComponent.setAttribute('choice-id', choiceIds.join(','));
      },

      getDefaultChoiceIds(): string[] {
        return (defaultChoiceIdsRef.current || []).map(({ id }) => id);
      },

      getCanvasId() {
        return canvasIdRef.current;
      },

      getContentState() {
        const _manifestId = manifestIdRef?.current ? manifestIdRef?.current : manifestId;
        const _canvasId = canvasIdRef?.current ? canvasIdRef?.current : canvasId;
        const contentState: ContentState = {
          id: `${_canvasId}#xywh=${runtime.current?.x},${runtime.current?.y},${runtime.current?.width},${runtime.current?.height}`,
          type: 'Canvas',
          partOf: [{ id: _manifestId, type: 'Manifest' }],
        };
        const ContentStateEvent = {
          contentState,
          normalisedContentState: normaliseContentState(contentState),
          encodedContentState: serialiseContentState(contentState),
        };

        return ContentStateEvent;
      },

      getPosition() {
        return {
          x: runtime.current?.x,
          y: runtime.current?.y,
          width: runtime.current?.width,
          height: runtime.current?.height,
        };
      },

      getManifestId() {
        return manifestIdRef.current;
      },

      disableTextSelection() {
        htmlComponent.setAttribute('text-selection-enabled', 'false');
      },

      enableTextSelection() {
        htmlComponent.setAttribute('text-selection-enabled', 'true');
      },

      enableText() {
        htmlComponent.setAttribute('text-enabled', 'true');
      },

      disableText() {
        htmlComponent.setAttribute('text-enabled', 'true');
      },

      easingFunctions() {
        return easingFunctions;
      },

      getContentStateStack() {
        return contentStateStack.current;
      },

      transition(callback: (transitionManager: any) => void) {
        if (runtime.current?.transitionManager) {
          callback(runtime.current?.transitionManager);
        }
      },

      enableContentStateSelection(callback: ContentStateCallback) {
        setMode('sketch');
        setContentStateCallback((prevCallback: ContentStateCallback | undefined) => {
          return prevCallback ? prevCallback : callback;
        });
      },

      disableContentStateSelection() {
        setContentStateCallback(undefined);
        setMode('explore');
        contentStateStack.current = [];
      },

      setContentStateFromText(text: string, immediate = false) {
        if (text == undefined || text.trim() === '') {
          return;
        }
        const contentState = normaliseContentState(parseContentState(text));
        contentState.immediate = immediate;
        const firstTarget = contentState.target[0];

        if (canvasIdRef.current === firstTarget.source.id) {
          if (
            runtime.current &&
            contentState.target &&
            contentState.target[0] &&
            contentState.target[0].selector &&
            contentState.target[0].selector.type === 'BoxSelector'
          ) {
            runtime.current.world.gotoRegion({ ...contentState.target[0].selector.spatial, immediate });
          }
        } else {
          setParsedContentState(contentState);
        }
      },
    };
  });

  useLayoutEffect(() => {
    if (contentStateToLoad && !error) {
      fetch(contentStateToLoad)
        .then((r) => r.json())
        .then((rawState) => {
          setParsedContentState(parseContentStateParameter(rawState));
        })
        .catch((err) => {
          console.error(err);
          setError(new Error(`Failed to load content state from ${contentStateToLoad} \n\n ${err.toString()}`));
        });
    }
  }, [contentStateToLoad, error]);

  useLayoutEffect(() => {
    if (contentState) {
      if (contentState.target.length) {
        const firstTarget = contentState.target[0];
        if (firstTarget.type === 'SpecificResource' && firstTarget.source.type === 'Canvas') {
          const manifestSource = (firstTarget.source.partOf || []).find((s) => s.type === 'Manifest');
          setCanvasId(firstTarget.source.id);
          if (manifestSource) {
            setManifestId(manifestSource.id);
          }
          if (firstTarget.selector && runtime.current && webComponent.current) {
            if (firstTarget.selector.type === 'BoxSelector') {
              const { x, y, width, height } = firstTarget.selector.spatial;
              runtime.current.world.gotoRegion({
                x,
                y,
                width,
                height,
                immediate: contentState.immediate,
              });
            } else {
              setParsedTarget(firstTarget);
            }
          }
        }
      }
    }
  }, [contentState]);

  useEffect(() => {
    onCanvasChange(canvasId);
  }, [canvasId]);

  // Waiting for config.
  if (isConfigBlocking) {
    return null;
  }

  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={() => setError(null)} />;
  }

  const canvasInner = canvasId ? (
    <CanvasContext canvas={canvasId}>
      <ViewCanvas
        // Escape hatch for bugs - to be improved.
        key={`${canvasId}-${viewport ? 'v1' : 'v0'}`}
        interactive={interactive}
        defaultChoices={defaultChoices}
        followAnnotations={followAnnotations}
        className={className}
        highlight={highlight}
        debug={debug}
        virtualSizes={virtualSizes}
        highlightCssClass={highlightCssClass}
        canvasId={canvasId}
        displayOptions={atlasProps}
        mode={mode}
        x={x}
        y={y}
        textEnabled={textEnabled}
        textSelectionEnabled={textSelectionEnabled}
        disableThumbnail={disableThumbnail}
        skipSizes={skipSizes}
        homeCover={homeCover}
      >
        <slot name="atlas" />
        {contentStateCallback ? <DrawBox onCreate={onDrawBox} /> : null}
      </ViewCanvas>
      {/* Default slot. */}
      <slot />
    </CanvasContext>
  ) : null;

  return (
    <RegisterPublicApi.Provider value={props.__registerPublicApi}>
      <VaultProvider vault={vault}>
        <VirtualAnnotationProvider>
          {manifestId ? <ManifestLoader manifestId={manifestId}>{canvasInner}</ManifestLoader> : canvasInner}
        </VirtualAnnotationProvider>
      </VaultProvider>
      {inlineStyles ? <style>{inlineStyles}</style> : null}
      {inlineStyleSheet ? <link rel="stylesheet" href={inlineStyleSheet} /> : null}
    </RegisterPublicApi.Provider>
  );
};

if (typeof window !== 'undefined') {
  register(CanvasPanel, 'canvas-panel', canvasPanelAttributes, {
    shadow: true,
    onConstruct(instance: any) {
      Object.defineProperty(instance, 'vault', {
        get(): any {
          return instance._props.vault;
        },
        set(v): any {
          instance._props.vault = v;
        },
      });
      instance._props = {
        __registerPublicApi: (api: any) => {
          Object.assign(instance, api(instance));
        },
      };
    },
  } as any);
}

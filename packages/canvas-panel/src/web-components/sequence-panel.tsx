import register from '../library/preact-custom-element';
import { GenericAtlasComponent } from '../types/generic-atlas-component';
import { useGenericAtlasProps } from '../hooks/use-generic-atlas-props';
import { ChoiceDescription, SimpleViewerProvider, VaultProvider } from 'react-iiif-vault';
import { ContentState } from '@iiif/vault-helpers';
import { ViewCanvas } from '../components/ViewCanvas/ViewCanvas';
import { RegisterPublicApi } from '../hooks/use-register-public-api';
import { VirtualAnnotationProvider } from '../hooks/use-virtual-annotation-page-context';
import { h } from 'preact';
import { parseBool, parseNumber, parseContentStateParameter } from '../helpers/parse-attributes';
import { useCallback, useLayoutEffect } from 'preact/compat';
import { baseAttributes } from '../helpers/base-attributes';
import { normaliseAxis, parseContentState, serialiseContentState } from '../helpers/content-state/content-state';
import { normaliseContentState } from '../helpers/content-state/content-state';
import { useState } from 'preact/compat';

export type SequencePanelProps = GenericAtlasComponent<{
  manifestId: string;
  rangeId?: string;
  startCanvas?: string;
  iiifContent?: string;
  pagingEnabled?: boolean;
  canvasIds?: string;
  textSelectionEnabled?: 'true' | 'false' | boolean;
  textEnabled?: 'true' | 'false' | boolean;
  followAnnotations?: 'true' | 'false' | boolean;
  margin?: number;
}>;

const sequencePanelAttributes = [
  ...baseAttributes,
  'manifest-id',
  'range-id',
  'start-canvas',
  'paging-enabled',
  'text-selection-enabled',
  'text-enabled',
  'follow-annotations',
  'margin',
];

export function SequencePanel(props: SequencePanelProps) {
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
    className,
    inlineStyles,
    inlineStyleSheet,
    useProp,
    useRegisterWebComponentApi,
    setMode,
  } = useGenericAtlasProps(props);
  const [manifestId, setManifestId, , manifestIdRef] = useProp('manifestId');
  const [rangeId, , , rangeIdRef] = useProp('rangeId');
  const [startCanvas, setStartCanvas, , startCanvasRef] = useProp('startCanvas');
  const [margin] = useProp('margin', { parse: parseNumber, defaultValue: 0 });
  const [pagingEnabled] = useProp('pagingEnabled', { parse: parseBool, defaultValue: true });
  const [textSelectionEnabled] = useProp('textSelectionEnabled', { parse: parseBool, defaultValue: true });
  const [textEnabled] = useProp('textEnabled', { parse: parseBool, defaultValue: false });
  const [followAnnotations] = useProp('followAnnotations', { parse: parseBool, defaultValue: true });
  const [unknownContentState, , setParsedContentState] = useProp('iiifContent', {
    parse: parseContentStateParameter,
  });
  const contentState =
    unknownContentState && unknownContentState.type !== 'remote-content-state' ? unknownContentState : null;
  const contentStateToLoad =
    unknownContentState && unknownContentState.type === 'remote-content-state' ? unknownContentState.id : null;
  const [error, setError] = useState<Error | null>();

  const onChoiceChange = useCallback((choice?: ChoiceDescription) => {
    if (webComponent.current) {
      webComponent.current.dispatchEvent(new CustomEvent('choice', { detail: { choice } }));
    }
  }, []);

  useRegisterWebComponentApi((htmlComponent: HTMLElement) => {
    return {
      vault,
      setManifest: (id: string) => {
        htmlComponent.setAttribute('manifest-id', id);
      },
      setRange: (id: string) => {
        htmlComponent.setAttribute('range-id', id);
      },
      getRangeId() {
        return rangeIdRef.current;
      },

      getContentState() {
        const _manifestId = manifestIdRef?.current ? manifestIdRef?.current : manifestId;
        // not sure if there's a better way to get at this?
        const el = webComponent.current;
        const sequenceInfo = (el as any).sequence;

        const _canvasId = sequenceInfo.items[sequenceInfo.sequence[sequenceInfo.currentSequenceIndex][0]].id;

        // eslint-disable-next-line prefer-const
        let { x, y, width, height } = runtime?.current || {};

        const contentState: ContentState = {
          id: `${_canvasId}#xywh=${normaliseAxis(x)},${normaliseAxis(y)},${width},${height}`,
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

      setContentStateFromText(text: string) {
        const contentState = normaliseContentState(parseContentState(text));
        setParsedContentState(contentState);
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

          // not sure if there's a better way to get at this?
          const el = webComponent.current;
          const sequenceInfo = (el as any).sequence;

          sequenceInfo.setCurrentCanvasId(firstTarget.source.id);
          if (manifestSource) {
            setManifestId(manifestSource.id);
          }
          if (firstTarget.selector && firstTarget.selector.type === 'BoxSelector') {
            const { x, y, width, height } = firstTarget.selector.spatial;
            runtime?.current?.world.gotoRegion({
              x,
              y,
              width,
              height,
            });
          }
        }
      }
    }
  }, [contentState]);

  if (!manifestId || isConfigBlocking) {
    return null;
  }

  return (
    <RegisterPublicApi.Provider value={props.__registerPublicApi}>
      <VaultProvider vault={vault}>
        <VirtualAnnotationProvider>
          <SimpleViewerProvider
            manifest={manifestId}
            startCanvas={startCanvas}
            rangeId={rangeId}
            pagingEnabled={pagingEnabled}
          >
            <ViewCanvas
              renderMultiple={true}
              // Escape hatch for bugs - to be improved.
              key={`${startCanvas}-${viewport ? 'v1' : 'v0'}`}
              interactive={interactive}
              followAnnotations={followAnnotations}
              onChoiceChange={onChoiceChange}
              className={className}
              highlight={highlight}
              debug={debug}
              virtualSizes={virtualSizes}
              highlightCssClass={highlightCssClass}
              displayOptions={atlasProps}
              mode={mode}
              textEnabled={textEnabled}
              textSelectionEnabled={textSelectionEnabled}
              margin={margin}
            >
              <slot name="atlas" />
              {/*{contentStateCallback ? <DrawBox onCreate={onDrawBox} /> : null}*/}
            </ViewCanvas>
            {/* Default slot. */}
            <slot />
          </SimpleViewerProvider>
        </VirtualAnnotationProvider>
      </VaultProvider>
      {inlineStyles ? <style>{inlineStyles}</style> : null}
      {inlineStyleSheet ? <link rel="stylesheet" href={inlineStyleSheet} /> : null}
    </RegisterPublicApi.Provider>
  );
}

if (typeof window !== 'undefined') {
  const config = {
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
  } as any;

  register(SequencePanel, 'sequence-panel', sequencePanelAttributes, config);
}

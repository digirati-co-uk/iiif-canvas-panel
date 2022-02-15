import { h } from 'preact';
import { FC, useCallback, useEffect, useLayoutEffect } from 'preact/compat';
import register from 'preact-custom-element';
import { CanvasContext, VaultProvider, ChoiceDescription } from 'react-iiif-vault';
import { RegisterPublicApi, UseRegisterPublicApi } from '../hooks/use-register-public-api';
import { ViewCanvas } from '../components/ViewCanvas/ViewCanvas';
import { ManifestLoader } from '../components/manifest-loader';
import { parseBool, parseChoices, parseContentStateParameter } from '../helpers/parse-attributes';
import { parseContentState } from '../helpers/content-state/content-state';
import { normaliseContentState } from '../helpers/content-state/content-state';
import { GenericAtlasComponent } from '../types/generic-atlas-component';
import { useGenericAtlasProps } from '../hooks/use-generic-atlas-props';

export type CanvasPanelProps = GenericAtlasComponent<
  {
    manifestId: string;
    canvasId?: string;
    choiceId?: string | string[];
    textSelectionEnabled?: 'true' | 'false' | boolean;
    textEnabled?: 'true' | 'false' | boolean;
    followAnnotations?: boolean;
    iiifContent?: string;
  },
  UseRegisterPublicApi['properties']
>;

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
    className,
    inlineStyles,
    inlineStyleSheet,
    useProp,
    useRegisterWebComponentApi,
  } = useGenericAtlasProps(props);

  const [contentState, , setParsedContentState] = useProp('iiifContent', { parse: parseContentStateParameter });
  const [canvasId, setCanvasId, , canvasIdRef] = useProp('canvasId');
  const [manifestId, setManifestId, , manifestIdRef] = useProp('manifestId');
  const [followAnnotations] = useProp('followAnnotations', { parse: parseBool, defaultValue: true });
  const [defaultChoices, , , defaultChoiceIdsRef] = useProp('choiceId', { parse: parseChoices });
  const [textSelectionEnabled] = useProp('textSelectionEnabled', { parse: parseBool, defaultValue: true });
  const [textEnabled] = useProp('textEnabled', { parse: parseBool, defaultValue: false });

  const onChoiceChange = useCallback((choice?: ChoiceDescription) => {
    if (webComponent.current) {
      webComponent.current.dispatchEvent(new CustomEvent('choice', { detail: { choice } }));
    }
  }, []);

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

      setContentStateFromText(text: string) {
        const contentState = normaliseContentState(parseContentState(text));
        const firstTarget = contentState.target[0];

        if (canvasIdRef.current === firstTarget.source.id) {
          if (
            runtime.current &&
            contentState.target &&
            contentState.target[0] &&
            contentState.target[0].selector &&
            contentState.target[0].selector.type === 'BoxSelector'
          ) {
            runtime.current.world.gotoRegion(contentState.target[0].selector);
          }
        } else {
          setParsedContentState(contentState);
        }
      },

      // addHighlight(region: string | TBC, options?: TBC): string {},
      // displayAnnotations() {},
      // enableTextSelection() {},
      // getAnnotationPageManager(): {
      //   getAvailablePageIds(): void;
      //   getEnabledPageIds(): void;
      //   setPageEnabled(pageId: string): void;
      //   setPageDisabled(pageId: string): void;
      //   setPageStyle(pageId: string, style: TBC): void;
      // } {},
      // getTextContent(options?: { html?: boolean; motivation?: string; selected?: boolean }): TBC[] {},
      // query(format: TBC): { addEventListener(): void } & TBC {},
      // removeHighlight(id: string | AnnotationNormalized) {},
      // setAnnotationOptions(options: {
      //   highlighting: { cssClass: string; visible: boolean; selectable: boolean };
      //   linking: { cssClass: string; visible: boolean; selectable: boolean };
      //   text: { cssClass: string; visible: boolean; selectable: boolean };
      // }) {},
      // setRenderMode(mode: 'zoom' | 'static' | 'responsive') {},
    };
  });

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
          if (firstTarget.selector) {
            setParsedTarget(firstTarget);
          }
        }
      }
    }
  }, [contentState]);

  useEffect(() => {
    console.log('unused state', {
      textSelectionEnabled,
      textEnabled,
      preferredFormats,
      highlight,
    });
  }, []);

  // Waiting for config.
  if (isConfigBlocking) {
    return null;
  }

  const canvasInner = canvasId ? (
    <CanvasContext canvas={canvasId}>
      <ViewCanvas
        // Escape hatch for bugs - to be improved.
        key={`${viewport ? 'v1' : 'v0'}`}
        defaultChoices={defaultChoices}
        followAnnotations={followAnnotations}
        onChoiceChange={onChoiceChange}
        className={className}
        highlight={highlight}
        debug={debug}
        virtualSizes={virtualSizes}
        highlightCssClass={highlightCssClass}
        canvasId={canvasId}
        displayOptions={atlasProps}
      >
        <slot name="atlas" />
      </ViewCanvas>
      {/* Default slot. */}
      <slot />
    </CanvasContext>
  ) : null;

  return (
    <RegisterPublicApi.Provider value={props.__registerPublicApi}>
      <VaultProvider vault={vault}>
        {manifestId ? <ManifestLoader manifestId={manifestId}>{canvasInner}</ManifestLoader> : canvasInner}
      </VaultProvider>
      {inlineStyles ? <style>{inlineStyles}</style> : null}
      {inlineStyleSheet ? <link rel="stylesheet" href={inlineStyleSheet} /> : null}
    </RegisterPublicApi.Provider>
  );
};

register(
  CanvasPanel,
  'canvas-panel',
  [
    'manifest-id',
    'canvas-id',
    'width',
    'height',
    'follow-annotations',
    'target',
    'region',
    'highlight',
    'highlight-css-class',
    'text-selection-enabled',
    'text-enabled',
    'preferred-formats',
    'atlas-mode',
    'style-id',
    'debug',
    'preset',
    'responsive',
    'interactive',
    'iiif-content',
    'class',
    'choice-id',
  ],
  {
    shadow: true,
    onConstruct(instance: any) {
      instance._props = {
        __registerPublicApi: (api: any) => {
          Object.assign(instance, api(instance));
        },
      };
    },
  } as any
);

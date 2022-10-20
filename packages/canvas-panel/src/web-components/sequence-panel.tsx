import register from '../library/preact-custom-element';
import { LayoutContainer } from './layout-container';
import { GenericAtlasComponent } from '../types/generic-atlas-component';
import { useGenericAtlasProps } from '../hooks/use-generic-atlas-props';
import { CanvasContext, SimpleViewerProvider, VaultProvider } from 'react-iiif-vault';
import { ViewCanvas } from '../components/ViewCanvas/ViewCanvas';
import { DrawBox } from '@atlas-viewer/atlas';
import { RegisterPublicApi } from '../hooks/use-register-public-api';
import { VirtualAnnotationProvider } from '../hooks/use-virtual-annotation-page-context';
import { ManifestLoader } from '../components/manifest-loader';
import { h } from 'preact';
import { parseBool } from '../helpers/parse-attributes';
import { RenderAllCanvases } from '../components/RenderAllCanvases';

export type SequencePanelProps = GenericAtlasComponent<{
  manifestId: string;
  rangeId?: string;
  startCanvas?: string;
  pagingEnabled?: boolean;
  canvasIds?: string;
  textSelectionEnabled?: 'true' | 'false' | boolean;
  textEnabled?: 'true' | 'false' | boolean;
  followAnnotations?: 'true' | 'false' | boolean;
}>;

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
  const [rangeId, setRangeId, , rangeIdRef] = useProp('rangeId');
  const [startCanvas] = useProp('startCanvas');
  const [pagingEnabled] = useProp('pagingEnabled', { parse: parseBool, defaultValue: true });
  const [textSelectionEnabled] = useProp('textSelectionEnabled', { parse: parseBool, defaultValue: true });
  const [textEnabled] = useProp('textEnabled', { parse: parseBool, defaultValue: false });
  const [followAnnotations] = useProp('followAnnotations', { parse: parseBool, defaultValue: true });

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
      getManifestId() {
        return manifestIdRef.current;
      },
    };
  });

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
              key={`${viewport ? 'v1' : 'v0'}`}
              interactive={interactive}
              followAnnotations={followAnnotations}
              className={className}
              highlight={highlight}
              debug={debug}
              virtualSizes={virtualSizes}
              highlightCssClass={highlightCssClass}
              displayOptions={atlasProps}
              mode={mode}
              textEnabled={textEnabled}
              textSelectionEnabled={textSelectionEnabled}
            >
              <slot name="atlas" />
              {/*{contentStateCallback ? <DrawBox onCreate={onDrawBox} /> : null}*/}
            </ViewCanvas>
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
      instance._props = {
        __registerPublicApi: (api: any) => {
          Object.assign(instance, api(instance));
        },
      };
    },
  } as any;

  register(SequencePanel, 'sequence-panel', [], config);
}

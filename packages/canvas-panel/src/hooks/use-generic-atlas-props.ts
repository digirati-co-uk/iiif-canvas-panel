import { GenericAtlasComponent } from '../types/generic-atlas-component';
import { useExistingVaultOrGlobal } from './use-existing-vault';
import { usePresetConfig } from './use-preset-config';
import { Ref, useLayoutEffect, useMemo, useRef, useState } from 'preact/compat';
import { useImageServiceLoader } from 'react-iiif-vault';
import { BoxStyle, Runtime, AtlasProps } from '@atlas-viewer/atlas';
import { useSyncedState } from './use-synced-state';
import {
  parseBool,
  parseCSV,
  parseNumber,
  parseOptionalSelector,
  parseSizeParameter,
} from '../helpers/parse-attributes';
import { Reference, Selector } from '@iiif/presentation-3';
import { AnnotationDisplay } from '../helpers/annotation-display';
import { ImageCandidateRequest } from '@atlas-viewer/iiif-image-api';
import { createStylesHelper, createThumbnailHelper } from '@iiif/vault-helpers';

export function useGenericAtlasProps<T = Record<never, never>>(props: GenericAtlasComponent<T>) {
  const webComponent = useRef<HTMLElement>();
  const vault = useExistingVaultOrGlobal();
  const loader = useImageServiceLoader();
  const { isReady, isConfigBlocking, setIsReady, internalConfig } = usePresetConfig<GenericAtlasComponent<T>>(
    props.preset
  );
  const styles = useMemo(() => createStylesHelper(vault), [vault]);
  const thumbs = useMemo(() => createThumbnailHelper(vault, { imageServiceLoader: loader }), [vault, loader]);
  const runtime = useRef<Runtime>();
  const [render] = useSyncedState<'canvas' | 'webgl' | 'static' | undefined>(props.render, {
    defaultValue: 'canvas',
  });
  const [className] = useSyncedState(props['class']);
  const [virtualSizes] = useSyncedState(props.virtualSizes || internalConfig.virtualSizes, {
    parse: parseSizeParameter,
  });
  const [height] = useSyncedState(props.height || internalConfig.height, {
    parse: parseNumber,
  });
  const [width] = useSyncedState(props.width || internalConfig.width, {
    parse: parseNumber,
  });
  const [interactive] = useSyncedState(props.interactive || internalConfig.interactive, {
    parse: parseBool,
    defaultValue: true,
  });
  const [viewport] = useSyncedState(props.viewport || internalConfig.viewport, {
    parse: parseBool,
    defaultValue: true,
  });
  const [responsive] = useSyncedState(props.responsive || internalConfig.responsive, {
    parse: parseBool,
    defaultValue: true,
  });
  const [debug] = useSyncedState(props.debug || internalConfig.debug, { parse: parseBool });

  const [target, setTarget, setParsedTarget, targetRef] = useSyncedState(
    props.target || props.region || internalConfig.target || internalConfig.region,
    {
      parse: parseOptionalSelector,
    }
  );

  const [highlight, setHighlight, , highlightRef] = useSyncedState(props.highlight || internalConfig.highlight, {
    parse: parseOptionalSelector,
  });
  const [styleId] = useSyncedState(props.styleId || internalConfig.styleId);
  const [highlightCssClass] = useSyncedState(props.highlightCssClass || internalConfig.highlightCssClass, {
    defaultValue: 'canvas-panel-highlight',
  });

  const [preferredFormats, , , preferredFormatsRef] = useSyncedState(
    props.preferredFormats || internalConfig.preferredFormats,
    {
      parse: parseCSV,
    }
  );
  const [mode] = useSyncedState(props.atlasMode || internalConfig.atlasMode);
  const [inlineStyles, setInlineStyles] = useState('');
  const [inlineStyleSheet] = useSyncedState(props.stylesheet || internalConfig.stylesheet);

  function useProp<K extends keyof T, V = T[K]>(
    prop: K,
    options: { parse?: (input: T[K]) => V; defaultValue?: V } = {}
  ): readonly [V, (newValue: T[K]) => void, (newValue: V) => void, Ref<V | undefined>] {
    return useSyncedState<T[K], V>((props as any)[prop] || internalConfig[prop], options);
  }

  function useRegisterWebComponentApi<PublicApi>(register: (htmlComponent: HTMLElement) => Partial<PublicApi>) {
    useLayoutEffect(() => {
      if (props.__registerPublicApi) {
        props.__registerPublicApi(register as any);
      }
    }, []);
  }

  useRegisterWebComponentApi((htmlComponent) => {
    webComponent.current = htmlComponent;
    return {
      vault,

      getHighlight: () => {
        return highlightRef.current;
      },
      setHighlight: (newHighlight: Selector | Selector[] | undefined) => {
        if (typeof newHighlight === 'string') {
          htmlComponent.setAttribute('highlight', newHighlight);
        } else {
          setHighlight(newHighlight);
        }
      },
      getTarget: () => {
        return targetRef.current;
      },
      setTarget: (newTarget: Selector | Selector[] | undefined) => {
        if (typeof newTarget === 'string') {
          htmlComponent.setAttribute('target', newTarget);
        } else {
          setTarget(newTarget);
        }
      },
      setDefaultChoiceIds: (choiceIds: string[]) => {
        htmlComponent.setAttribute('choice-id', choiceIds.join(','));
      },

      goHome(immediate = false) {
        if (runtime.current) {
          runtime.current.world.goHome(immediate);
        }
      },

      goToTarget(
        target: {
          x: number;
          y: number;
          height: number;
          width: number;
        },
        options: {
          padding?: number;
          nudge?: boolean;
          immediate?: boolean;
        } = {}
      ) {
        if (runtime.current) {
          runtime.current.world.gotoRegion({ ...target, ...options });
        }
      },

      setFps(frames: number) {
        if (runtime.current) {
          runtime.current.fpsLimit = frames;
        }
      },

      clearTarget() {
        setTarget(undefined);
        if (runtime.current) {
          runtime.current.world.goHome(true);
        }
      },

      setPreferredFormats(formats: string[]) {
        htmlComponent.setAttribute('preferred-formats', formats.join(','));
      },

      getPreferredFormats() {
        return preferredFormatsRef.current || [];
      },

      setMode(mode: 'sketch' | 'explore') {
        htmlComponent.setAttribute('atlas-mode', mode);
      },

      applyStyles(resource: string | Reference<any>, style: BoxStyle) {
        styles.applyStyles(typeof resource === 'string' ? { id: resource } : resource, 'atlas', style);
      },

      createAnnotationDisplay(source: any) {
        return new AnnotationDisplay(source);
      },

      getThumbnail(input: any, request: ImageCandidateRequest, dereference?: boolean) {
        return thumbs.getBestThumbnailAtSize(input, request, dereference);
      },
    };
  });

  useLayoutEffect(() => {
    if (target && isReady && runtime.current && target.selector && target.selector.type === 'BoxSelector') {
      runtime.current.transitionManager.goToRegion(target.selector, { transition: { duration: 0 } });
      runtime.current.transitionManager.runTransition(runtime.current.target, 5);
    }
  }, [isReady, target]);

  useLayoutEffect(() => {
    if (styleId) {
      const inlineStyleTag = document.getElementById(styleId);
      if (inlineStyleTag) {
        setInlineStyles(inlineStyleTag.innerText);
      }
    }
  }, [isReady, styleId]);

  const atlasProps = useMemo(() => {
    return {
      responsive,
      viewport,
      // Defaults for now.
      onCreated: (rt: { runtime: Runtime }) => {
        setIsReady(true);
        runtime.current = rt.runtime;
      },
      homePosition: target && target.selector && target.selector.type === 'BoxSelector' ? target.selector : undefined,
      mode,
      renderPreset:
        render === 'static'
          ? [
              'static-preset',
              {
                interactive,
              },
            ]
          : [
              'default-preset',
              {
                interactive,
                unstable_webglRenderer: render === 'webgl',
              },
            ],
      width: width ? width : undefined,
      height: height ? height : 512,
    } as AtlasProps;
  }, [responsive, viewport, target, mode, render, internalConfig]);

  return {
    atlasProps,
    isReady,
    isConfigBlocking,
    setIsReady,
    internalConfig,
    target,
    setParsedTarget,
    highlight,
    highlightCssClass,
    preferredFormats,
    render,
    interactive,
    mode,
    virtualSizes,
    styleId,
    responsive,
    viewport,
    debug,
    height,
    width,
    className,
    inlineStyles,
    inlineStyleSheet,
    vault,
    useProp,
    useRegisterWebComponentApi,
    runtime,
    webComponent,
  };
}

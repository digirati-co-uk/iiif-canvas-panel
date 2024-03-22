import { GenericAtlasComponent } from '../types/generic-atlas-component';
import { usePresetConfig } from './use-preset-config';
import { Ref, useLayoutEffect, useMemo, useRef, useState } from 'preact/compat';
import { useImageServiceLoader, useExistingVault } from 'react-iiif-vault';
import { BoxStyle, Runtime, AtlasProps, Preset, easingFunctions } from '@atlas-viewer/atlas';
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
import { createEventsHelper, createStylesHelper, createThumbnailHelper } from '@iiif/vault-helpers';
import { useEffect } from 'preact/compat';
import { globalVault } from '@iiif/vault';

export function useGenericAtlasProps<T = Record<never, never>>(props: GenericAtlasComponent<T>) {
  const webComponent = useRef<HTMLElement>();
  const ZOOM_OUT_FACTOR = 0.75;
  const ZOOM_IN_FACTOR = 1.0 / 0.75;
  const existingVault = useExistingVault();
  const vault = props.vault || existingVault || globalVault();
  const loader = useImageServiceLoader();
  const mediaEventQueue = useRef<Record<string, any>>({});
  const { isReady, isConfigBlocking, setIsReady, internalConfig } = usePresetConfig<GenericAtlasComponent<T>>(
    props.preset,
    (query, config) => {
      if (webComponent.current) {
        webComponent.current.dispatchEvent(new CustomEvent('media', { detail: { query, config } }));
      } else {
        mediaEventQueue.current[query] = config;
      }
    }
  );
  const events = useMemo(() => createEventsHelper(vault as any), [vault]);
  const styles = useMemo(() => createStylesHelper(vault), [vault]);
  const thumbs = useMemo(() => createThumbnailHelper(vault, { imageServiceLoader: loader }), [vault, loader]);
  const [nested] = useSyncedState(props.nested || internalConfig.nested, { parse: parseBool, defaultValue: false });
  const [x] = useSyncedState(props.x || internalConfig.x, { parse: parseNumber, defaultValue: 0 });
  const [y] = useSyncedState(props.y || internalConfig.y, { parse: parseNumber, defaultValue: 0 });
  const runtime = useRef<Runtime>();
  const [render] = useSyncedState<'canvas' | 'webgl' | 'static' | undefined>(props.render || internalConfig.render, {
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
  const [moveEvents] = useSyncedState(props.moveEvents || internalConfig.moveEvents, {
    parse: parseBool,
    defaultValue: false,
  });
  const [granularMoveEvents] = useSyncedState(props.granularMoveEvents || internalConfig.granularMoveEvents, {
    parse: parseBool,
    defaultValue: false,
  });
  const [clickToEnableZoom] = useSyncedState(props.clickToEnableZoom || props.clickToEnableZoom, {
    parse: parseBool,
    defaultValue: true,
  });
  const [disableKeyboardNavigation] = useSyncedState(
    props.disableKeyboardNavigation || internalConfig.disableKeyboardNavigation,
    {
      parse: parseBool,
      defaultValue: false,
    }
  );
  const [debug] = useSyncedState(props.debug || internalConfig.debug, { parse: parseBool });
  const [enableNavigator] = useSyncedState(props.enableNavigator || internalConfig.enableNavigator, {
    parse: parseBool,
  });

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
  const [mode, setMode] = useSyncedState(props.atlasMode || internalConfig.atlasMode);
  const [inlineStyles, setInlineStyles] = useState('');
  const [inlineStyleSheet] = useSyncedState(props.stylesheet || internalConfig.stylesheet);
  const actionQueue = useRef<Record<string, (preset: Runtime) => void>>({});
  const [runtimeVersion, setRuntimeVersion] = useState('');

  function useProp<K extends keyof T, V = T[K]>(
    prop: K,
    options: { parse?: (input: T[K]) => V; defaultValue?: V } = {}
  ): readonly [V, (newValue: T[K]) => void, (newValue: V) => void, Ref<V | undefined>] {
    return useSyncedState<T[K], V>((props as any)[prop] || internalConfig[prop], options);
  }

  function getMinZoom() {
    if (webComponent.current && runtime.current) {
      const bounds = webComponent.current.getBoundingClientRect();
      const worldHeight = runtime.current.world.height || 1;
      const worldWidth = runtime.current.world.width || 1;
      const worldRatio = worldWidth / worldHeight;

      if (worldRatio < 1) {
        // Vertical.
        return bounds.height / worldHeight;
      } else {
        // Horizontal.
        return bounds.width / worldWidth;
      }
    }

    return -1;
  }

  useEffect(() => {
    const rt = runtime.current;
    const tm = runtime.current?.transitionManager;
    if (rt && tm && isReady) {
      if (webComponent.current) {
        webComponent.current.dispatchEvent(
          new CustomEvent('ready', {
            detail: {
              ...calculateZoomInformation(rt),
            },
          })
        );
      }
      // Add world subscribers?
      let isPending = false;

      let minZoomCount = 0;
      return rt.world.addLayoutSubscriber(async (ev, data) => {
        if (ev !== 'repaint' && webComponent.current) {
          if (['recalculate-world-size', 'zoom-to', 'go-home'].includes(ev)) {
            if (tm.hasPending()) {
              if (isPending) {
                return;
              }
              isPending = true;
              await new Promise((resolve) =>
                setTimeout(resolve, tm.pendingTransition.total_time - tm.pendingTransition.elapsed_time)
              );
              isPending = false;
            }

            const minZoom = getMinZoom();
            const isMin = Math.abs(minZoom - rt._lastGoodScale) < 0.0002;
            if (isMin) {
              minZoomCount++;
            } else {
              minZoomCount = 0;
            }
            const event = {
              detail: {
                source: ev,
                minZoomCount,
                ...calculateZoomInformation(rt),
                isMin,
                isMax: Math.abs(rt.maxScaleFactor - rt._lastGoodScale) < 0.0002,
                ...((data as any) || {}),
              },
            };

            webComponent.current.dispatchEvent(new CustomEvent('zoom', event));
            return;
          }
          webComponent.current.dispatchEvent(new CustomEvent(ev, { detail: data }));
        }
        return;
      });
    }

    return () => void 0;
  }, [isReady, runtimeVersion]);

  function calculateZoomInformation(rt?: Runtime) {
    if (rt) {
      const minZoom = getMinZoom();
      const canZoomOut = rt._lastGoodScale > minZoom || rt._lastGoodScale * ZOOM_OUT_FACTOR > minZoom;
      const canZoomIn = rt._lastGoodScale * ZOOM_IN_FACTOR < 1;
      return {
        canZoomIn,
        canZoomOut,
        scaleFactor: runtime.current?._lastGoodScale,
        current: rt._lastGoodScale,
        max: rt?.maxScaleFactor,
        min: minZoom,
      };
    }
    return {};
  }

  useEffect(() => {
    const rt = runtime.current;
    const tm = runtime.current?.transitionManager;
    if (isReady && rt && moveEvents) {
      let lastX = -1;
      let lastY = -1;
      let pending = false;
      return rt.registerHook('useAfterFrame', async () => {
        if (webComponent.current && (rt.target[1] !== lastX || rt.target[2] !== lastY)) {
          if (!granularMoveEvents && tm) {
            if (pending) {
              return;
            }
            if (tm.hasPending()) {
              pending = true;
              await new Promise((resolve) =>
                setTimeout(resolve, tm.pendingTransition.total_time - tm.pendingTransition.elapsed_time)
              );
              pending = false;
            }
          }

          webComponent.current.dispatchEvent(
            new CustomEvent('move', {
              detail: {
                x: rt.x,
                y: rt.y,
                width: rt.width,
                height: rt.height,
                points: rt.target,
                lastX: lastX,
                lastY: lastY,
              },
            })
          );
          lastX = rt.x;
          lastY = rt.y;
        }
      });
    }
    return () => void 0;
  }, [isReady, moveEvents]);

  function useRegisterWebComponentApi<PublicApi>(register: (htmlComponent: HTMLElement) => Partial<PublicApi>) {
    useLayoutEffect(() => {
      if (props.__registerPublicApi) {
        props.__registerPublicApi(register as any);
      }
    }, []);
  }

  useRegisterWebComponentApi((htmlComponent) => {
    webComponent.current = htmlComponent;

    let zoomPreventCallback: ((e: Event) => void) | undefined;
    let resetFunc: (() => void) | undefined;
    let zoomPrevented = false;

    if (clickToEnableZoom) {
      zoomPreventCallback = (e: Event) => {
        e.stopPropagation();
      };

      const registerFunc = () => {
        if (zoomPreventCallback && !zoomPrevented) {
          zoomPrevented = true;
          htmlComponent.addEventListener('wheel', zoomPreventCallback, { capture: true });
          htmlComponent.addEventListener('touchstart', zoomPreventCallback, { capture: true });
        }
      };

      resetFunc = () => {
        if (zoomPreventCallback && zoomPrevented) {
          zoomPrevented = false;
          htmlComponent.removeEventListener('wheel', zoomPreventCallback, { capture: true });
          htmlComponent.removeEventListener('touchstart', zoomPreventCallback, { capture: true });
        }
      };

      registerFunc();

      document.addEventListener('click', (e) => {
        if (document.activeElement !== htmlComponent) {
          registerFunc();
        }
      });
    }

    htmlComponent.addEventListener('click', (e) => {
      if (resetFunc) {
        resetFunc();
      }

      const targets = e.composedPath();
      const target = targets[0] as HTMLElement;
      if (target && htmlComponent !== document.activeElement) {
        target.focus();
      }
    });

    const mediaQueue = Object.keys(mediaEventQueue.current);
    if (mediaQueue.length) {
      for (const mediaEvent of mediaQueue) {
        htmlComponent.dispatchEvent(
          new CustomEvent('media', { detail: { query: mediaEvent, config: mediaEventQueue.current[mediaEvent] } })
        );
      }
      mediaEventQueue.current = {};
    }

    return {
      vault,
      events,
      styles,
      thumbnailHelper: thumbs,
      imageServiceLoader: loader,

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

      getPosition() {
        return {
          x: runtime.current?.x,
          y: runtime.current?.y,
          width: runtime.current?.width,
          height: runtime.current?.height,
        };
      },

      getMaxZoom() {
        return runtime.current?.maxScaleFactor || 1;
      },

      getMinZoom() {
        return getMinZoom() || 0;
      },

      zoomIn(point?: { x: number; y: number }) {
        if (runtime.current) {
          runtime.current.world.trigger('zoom-to', {
            point,
            factor: ZOOM_OUT_FACTOR,
          });
        }
      },

      zoomOut(point?: { x: number; y: number }) {
        if (runtime.current) {
          runtime.current.world.trigger('zoom-to', {
            point,
            factor: ZOOM_IN_FACTOR,
          });
        }
      },

      zoomBy(factor: number, point?: { x: number; y: number }) {
        if (runtime.current) {
          runtime.current.world.trigger('zoom-to', {
            point,
            factor,
          });
        }
      },

      // @todo deprecate/remove
      zoomTo(factor: number, point?: { x: number; y: number }, stream?: boolean) {
        if (runtime.current) {
          runtime.current.world.zoomTo(factor, point, stream);
        }
      },

      withAtlas(callback: (rt: Runtime) => void) {
        if (runtime.current) {
          callback(runtime.current);
        } else {
          actionQueue.current = {
            ...actionQueue.current,
            [new Date().getTime()]: (rt) => callback(rt),
          };
        }
      },

      goHome(immediate = false) {
        if (runtime.current) {
          runtime.current.world.goHome(immediate);
        } else {
          actionQueue.current = {
            ...actionQueue.current,
            viewport: (rt) => rt.world.goHome(immediate),
          };
        }
      },

      getZoom() {
        return runtime.current?._lastGoodScale;
      },

      getScaleInformation() {
        const rt = runtime.current;
        const lastGoodScale = rt?._lastGoodScale || 1;
        return {
          ...calculateZoomInformation(rt),
        };
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
        } else {
          actionQueue.current = {
            ...actionQueue.current,
            viewport: (rt) => {
              rt.world.gotoRegion({ ...target, ...options });
            },
          };
        }
      },

      setFps(frames: number) {
        if (runtime.current) {
          runtime.current.fpsLimit = frames;
        } else {
          actionQueue.current = {
            ...actionQueue.current,
            setFps: (rt) => {
              rt.fpsLimit = frames;
            },
          };
        }
      },

      clearTarget() {
        setTarget(undefined);
        if (runtime.current) {
          runtime.current.world.goHome(true);
        } else {
          actionQueue.current = {
            ...actionQueue.current,
            viewport: (rt) => {
              rt.world.goHome(true);
            },
          };
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

      applyHTMLProperties(
        resource: string | Reference<any>,
        style: Partial<{
          className?: string;
          href?: string;
          target?: string;
          title?: string;
        }>
      ) {
        styles.applyStyles(typeof resource === 'string' ? { id: resource } : resource, 'html', style);
      },

      setClassName(resource: string | Reference<any>, className: string) {
        styles.applyStyles(typeof resource === 'string' ? { id: resource } : resource, 'html', { className });
      },

      createAnnotationDisplay(source: any) {
        return new AnnotationDisplay(source);
      },

      getThumbnail(input: any, request: ImageCandidateRequest, dereference?: boolean) {
        return thumbs.getBestThumbnailAtSize(input, request, dereference);
      },
    };
  });

  useEffect(() => {
    if (runtime.current) {
      const actions = Object.values(actionQueue.current);
      for (const action of actions) {
        action(runtime.current);
      }
      actionQueue.current = {};
    }
  }, [isReady]);

  useLayoutEffect(() => {
    if (styleId) {
      const inlineStyleTag = document.getElementById(styleId);
      if (inlineStyleTag) {
        setInlineStyles(inlineStyleTag.innerText);
      }
    }
  }, [isReady, styleId]);

  useLayoutEffect(() => {
    if (webComponent.current && !disableKeyboardNavigation) {
      const keydownHandler = (e: KeyboardEvent) => {
        if (runtime.current && runtime.current.transitionManager) {
          const tm = runtime.current.transitionManager;
          const points = !tm.pendingTransition.done ? tm.pendingTransition.to : runtime.current.target;
          const moveBy = Math.min(points[3] - points[1], points[4] - points[2]) * 0.1;
          let newTarget;

          switch (e.key) {
            case '=': {
              runtime.current.world?.zoomIn();
              return;
            }
            case '-': {
              runtime.current.world?.zoomOut();
              return;
            }
            case '0': {
              runtime.current.world?.goHome();
              return;
            }
            case 'ArrowRight': {
              e.preventDefault();
              newTarget = points.slice(0);
              newTarget[1] = newTarget[1] + moveBy;
              newTarget[3] = newTarget[3] + moveBy;
              break;
            }
            case 'ArrowLeft': {
              e.preventDefault();
              newTarget = points.slice(0);
              newTarget[1] = newTarget[1] - moveBy;
              newTarget[3] = newTarget[3] - moveBy;
              break;
            }
            case 'ArrowUp': {
              e.preventDefault();
              newTarget = points.slice(0);
              newTarget[2] = newTarget[2] - moveBy;
              newTarget[4] = newTarget[4] - moveBy;
              break;
            }
            case 'ArrowDown': {
              e.preventDefault();
              newTarget = points.slice(0);
              newTarget[2] = newTarget[2] + moveBy;
              newTarget[4] = newTarget[4] + moveBy;
              break;
            }
          }

          if (newTarget) {
            tm.applyTransition(newTarget, {
              duration: 500,
              easing: easingFunctions.easeOutExpo,
              constrain: true,
            });
          }
        }
      };
      const wc = webComponent.current;
      wc.addEventListener('keydown', keydownHandler);
      return () => {
        wc.removeEventListener('keydown', keydownHandler);
      };
    }
    return () => void 0;
  }, [disableKeyboardNavigation]);

  const atlasProps = useMemo(() => {
    return {
      children: null,
      nested,
      responsive,
      viewport,
      enableNavigator,
      // Defaults for now.
      onCreated: (rt: { runtime: Runtime }) => {
        // @todo this means ready, but does not mean first item is in the world.
        setIsReady(true);
        setRuntimeVersion(rt.runtime.id);
        runtime.current = rt.runtime;
      },
      homePosition:
        target && target.selector && target.selector.type === 'BoxSelector' ? target.selector.spatial : undefined,
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
      height: height ? height : responsive ? undefined : 512,
    } as AtlasProps & { nested?: boolean };
  }, [responsive, viewport, target, render, enableNavigator, internalConfig]);

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
    setMode,
    virtualSizes,
    styleId,
    responsive,
    viewport,
    debug,
    enableNavigator,
    height,
    width,
    className,
    inlineStyles,
    inlineStyleSheet,
    vault,
    nested,
    x,
    y,
    useProp,
    useRegisterWebComponentApi,
    runtime,
    webComponent,
  };
}

import {
  createElement as h,
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  Fragment,
  type ReactNode,
} from "react";
import {
  AtlasContext,
  BoundsContext,
  ModeContext,
  ReactAtlas,
  defaultPreset,
  staticPreset,
  type Preset,
} from "@atlas-viewer/atlas/react";
import { ViewerPresetContext } from "react-iiif-vault/core";
import { AtlasDisplayOptions } from "../ViewCanvas/ViewCanvas.types";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
const ErrorBoundary = ReactErrorBoundary as any;
import { ErrorFallback } from "../ErrorFallback/ErrorFallback";
import { SceneHTML } from "../AtlasCanvas/presentation";
import { ContextBridge, useContextValues } from "../../library/context-bridge";

const InAtlasContext = createContext(false);
// Nested custom elements contribute separate subtrees to one Atlas root.
const scenes = new Map<Preset, Map<string, ReactNode>>();
function updateScene(preset: Preset, id: string, scene?: ReactNode) {
  const entries = scenes.get(preset);
  if (!entries) return;
  if (scene === undefined) entries.delete(id);
  else entries.set(id, scene);
  ReactAtlas.render(
    Array.from(entries, ([key, children]) => <Fragment key={key}>{children}</Fragment>),
    preset.runtime,
  );
}
export function NestedAtlas({
  children,
  nested,
  onCreated,
  ...props
}: AtlasDisplayOptions & { children: any; nested?: boolean }) {
  const existing = useContext(AtlasContext);
  const inAtlas = useContext(InAtlasContext);
  if (nested || inAtlas)
    return (
      <NestedScene preset={existing} onCreated={onCreated}>
        {children}
      </NestedScene>
    );
  return (
    <AtlasHost {...props} onCreated={onCreated}>
      {children}
    </AtlasHost>
  );
}
function NestedScene({ preset, onCreated, children }: any) {
  const values = useContextValues();
  const [id] = useState(() => crypto.randomUUID());
  const liveCreated = useRef(onCreated);
  liveCreated.current = onCreated;
  useLayoutEffect(() => {
    if (!preset) return;
    liveCreated.current?.(preset);
    return () => updateScene(preset, id);
  }, [preset, id]);
  useLayoutEffect(() => {
    if (preset) updateScene(preset, id, <ContextBridge values={values}>{children}</ContextBridge>);
  });
  return null;
}
function AtlasHost(props: AtlasDisplayOptions & { children: any }) {
  const outer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const navigator = useRef<HTMLCanvasElement>(null);
  const [preset, setPreset] = useState<Preset | null>(null);
  const [bounds, setBounds] = useState<any>(null);
  const values = useContextValues();
  const measureRef = useRef<() => void>(() => {});
  const live = useRef(props);
  live.current = props;
  const name = Array.isArray(props.renderPreset) ? props.renderPreset[0] : props.renderPreset;
  const options = Array.isArray(props.renderPreset) ? props.renderPreset[1] : undefined;
  // Only construction options replace the runtime, not dimensions or callback identity.
  const optionsKey = JSON.stringify(options || {});
  useLayoutEffect(() => {
    const element = outer.current!;
    const rect = element.getBoundingClientRect();
    const viewport = {
      x: 0,
      y: 0,
      width: rect.width || 1,
      height: rect.height || 512,
      scale: 1,
    };
    const made = (name === "static-preset" ? staticPreset : defaultPreset)({
      ...options,
      canvasElement: canvas.current!,
      containerElement: container.current!,
      overlayElement: overlay.current!,
      navigatorElement: props.enableNavigator ? navigator.current! : undefined,
      viewport,
      dpi: window.devicePixelRatio || 1,
      runtimeOptions: props.runtimeOptions,
      forceRefresh: () => made.runtime.updateNextFrame(),
    });
    // Atlas installs its wheel guard even when no interaction controller is created.
    // Static/responsive viewers must leave native page scrolling available.
    if (options?.interactive === false && made.em) {
      const surface: HTMLElement | undefined = made.canvas || made.container;
      surface?.removeEventListener("wheel", made.em.onWheelEvent);
    }
    scenes.set(made, new Map());
    // Both presets expose the same DOM sizing contract to this host.
    made.overlay = overlay.current!;
    let measured = false;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;
      if (measured && width === viewport.width && height === viewport.height) return;
      measured = true;
      if (made.canvas) {
        const dpi = window.devicePixelRatio || 1;
        made.canvas.width = Math.round(width * dpi);
        made.canvas.height = Math.round(height * dpi);
        const context = made.canvas.getContext("2d");
        context?.scale(dpi, dpi);
      }
      made.runtime.resize(viewport.width, width, viewport.height, height);
      viewport.width = width;
      viewport.height = height;
      for (const node of [container.current, overlay.current]) {
        if (node) {
          node.style.width = `${width}px`;
          node.style.height = `${height}px`;
        }
      }
      made.em?.updateBounds();
      setBounds({ ...rect.toJSON(), width, height });
      recalculateHome(made, live.current, width, height);
      made.runtime.goHome();
      made.runtime.updateNextFrame();
    };
    // Layout can move without resizing (scrolling, expanding docs, nested hosts).
    // Refresh the viewport origin before Atlas converts client coordinates.
    const refreshBounds = () => {
      made.em?.updateBounds();
      const rect = element.getBoundingClientRect();
      setBounds((previous: any) =>
        previous?.left === rect.left && previous?.top === rect.top ? previous : rect.toJSON(),
      );
    };
    const positionEvents = ["pointerdown", "pointermove", "wheel", "touchstart", "touchmove"];
    for (const event of positionEvents)
      element.addEventListener(event, refreshBounds, {
        capture: true,
        passive: true,
      });
    measureRef.current = measure;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const unsubscribe = made.runtime.world.addLayoutSubscriber((type) => {
      if (type === "recalculate-world-size" || type === "zone-changed") {
        recalculateHome(made, live.current, viewport.width, viewport.height);
        if (type === "recalculate-world-size") made.runtime.goHome();
      }
    });
    measure();
    setPreset(made);
    live.current.onCreated?.(made);
    return () => {
      observer.disconnect();
      for (const event of positionEvents) element.removeEventListener(event, refreshBounds, true);
      unsubscribe();
      // Dispose the world only after React has detached its scene children.
      scenes.delete(made);
      ReactAtlas.unmountComponentAtNode(made.runtime, () => made.unmount());
    };
  }, [name, optionsKey, props.enableNavigator]);
  useLayoutEffect(() => {
    measureRef.current();
  }, [props.width, props.height, props.aspectRatio]);
  useLayoutEffect(() => {
    if (!preset) return;
    preset.runtime.mode = props.mode || "explore";
    preset.runtime.setOptions(props.runtimeOptions || {});
    recalculateHome(preset, props, bounds?.width || 1, bounds?.height || 1);
  }, [preset, props.mode, props.homeCover, props.homePosition, props.runtimeOptions, bounds?.width, bounds?.height]);
  useLayoutEffect(() => {
    if (!preset) return;
    updateScene(
      preset,
      "host",
      <ContextBridge values={values}>
        <AtlasContext.Provider value={preset}>
          <BoundsContext.Provider value={bounds}>
            <ModeContext.Provider value={props.mode || "explore"}>
              <ViewerPresetContext.Provider value={preset}>
                <InAtlasContext.Provider value={true}>
                  <ErrorBoundary
                    fallbackRender={(fallback: any) => (
                      <SceneHTML>
                        <ErrorFallback {...fallback} />
                      </SceneHTML>
                    )}
                  >
                    {props.children}
                  </ErrorBoundary>
                </InAtlasContext.Provider>
              </ViewerPresetContext.Provider>
            </ModeContext.Provider>
          </BoundsContext.Provider>
        </AtlasContext.Provider>
      </ContextBridge>,
    );
  });
  const height = props.height ?? (props.aspectRatio ? undefined : 512);
  return (
    <div
      {...props.containerProps}
      ref={outer}
      className={`atlas-container atlas-canvas-container ${props.className || ""}`}
      role={props.role}
      title={props.title}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "var(--atlas-container-display, block)",
        flex: "var(--atlas-container-flex, none)",
        width: `var(--atlas-container-width, ${typeof props.width === "number" ? `${props.width}px` : props.width || "100%"})`,
        height: `var(--atlas-container-height, ${typeof height === "number" ? `${height}px` : height || "auto"})`,
        aspectRatio: height ? undefined : props.aspectRatio,
        background: props.background,
        ...props.containerProps?.style,
      }}
    >
      <style>{`.atlas-canvas,.atlas-static-container{display:block;width:100%;height:100%;outline:none;touch-action:${
        options?.interactive === false ? "auto" : "none"
      }}.atlas-static-container{position:relative;overflow:hidden}.atlas-overlay{position:absolute;inset:0;overflow:hidden;pointer-events:none}.atlas-static-image{position:absolute;user-select:none;transform-origin:0 0}.atlas-navigator{position:absolute;right:10px;top:10px;width:120px;height:120px;z-index:30}`}</style>
      {name === "static-preset" ? (
        <div ref={container} className="atlas-static-container" tabIndex={0} />
      ) : (
        <canvas ref={canvas} className="atlas-canvas" tabIndex={0} />
      )}
      <div ref={overlay} className="atlas-overlay" />
      {props.enableNavigator ? <canvas ref={navigator} className="atlas-navigator" width={240} height={240} /> : null}
    </div>
  );
}
function recalculateHome(preset: Preset, props: AtlasDisplayOptions, width: number, height: number) {
  const runtime = preset.runtime;
  if (props.homeCover && runtime.world.width && runtime.world.height) {
    const w = runtime.world.width,
      h = runtime.world.height;
    const ratio = width / height;
    const targetWidth = Math.min(w, h * ratio),
      targetHeight = Math.min(h, w / ratio);
    const factor = props.homeCover === "start" ? 0 : props.homeCover === "end" ? 1 : 0.5;
    runtime.manualHomePosition = true;
    runtime.setHomePosition({
      x: (w - targetWidth) * factor,
      y: (h - targetHeight) * factor,
      width: targetWidth,
      height: targetHeight,
    });
    if (props.homeOnResize) runtime.goHome({});
  } else {
    runtime.manualHomePosition = !!props.homePosition;
    runtime.setHomePosition(props.homePosition);
  }
}

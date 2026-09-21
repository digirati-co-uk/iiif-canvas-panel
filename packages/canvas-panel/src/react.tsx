import {
  createElement,
  forwardRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ReactVaultContext, Vault } from "react-iiif-vault/core";
import { defineCustomElements } from "./elements";
import type { CanvasPanelElement, CanvasPanelEventMap } from "./types/element";

export interface CanvasPanelProps {
  vault?: CanvasPanelElement["vault"];
  manifestId?: string;
  canvasId?: string;
  defaultCanvasId?: string;
  width?: number | string;
  height?: number | string;
  preset?: "zoom" | "static" | "responsive";
  rotation?: number;
  interactive?: boolean;
  nativeControls?: boolean;
  choiceIds?: string[];
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onReady?: (element: CanvasPanelElement) => void;
  onCanvasChange?: (detail: { canvasId: string | undefined }) => void;
  onChoice?: (detail: CanvasPanelEventMap["choice"]["detail"]) => void;
  onError?: (event: ErrorEvent) => void;
}

/** A React-owned shell around the same native element used by HTML and Vue. */
export const CanvasPanel = forwardRef<CanvasPanelElement, CanvasPanelProps>(function CanvasPanel(props, forwardedRef) {
  const inherited = useContext(ReactVaultContext).vault;
  const fallback = useRef<Vault | null>(null);
  const element = useRef<CanvasPanelElement | null>(null);
  const live = useRef(props);
  live.current = props;
  const initialCanvas = useRef(props.defaultCanvasId);
  const chosenVault = props.vault || inherited || (fallback.current ||= new Vault());
  const ref = useCallback(
    (node: CanvasPanelElement | null) => {
      element.current = node;
      if (typeof forwardedRef === "function") return forwardedRef(node);
      if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  useLayoutEffect(() => {
    const node = element.current!;
    const ready = () => live.current.onReady?.(node);
    const change = (event: CanvasPanelEventMap["canvas-change"]) => {
      if (live.current.canvasId === undefined) live.current.onCanvasChange?.({ canvasId: event.detail.canvas });
    };
    const request = (event: CustomEvent<{ canvasId: string }>) => {
      if (live.current.canvasId === undefined) return;
      event.preventDefault();
      live.current.onCanvasChange?.(event.detail);
    };
    const choice = (event: CanvasPanelEventMap["choice"]) => live.current.onChoice?.(event.detail);
    const error = (event: ErrorEvent) => live.current.onError?.(event);
    node.addEventListener("ready", ready);
    node.addEventListener("canvas-change", change);
    node.addEventListener("canvas-request", request as EventListener);
    node.addEventListener("choice", choice);
    node.addEventListener("cp-load-error", error);
    // Set the property before upgrade. Registration preserves pre-upgrade Vault assignments.
    node.vault = chosenVault as CanvasPanelElement["vault"];
    defineCustomElements();
    if (initialCanvas.current !== undefined && live.current.canvasId === undefined)
      node.setAttribute("canvas-id", initialCanvas.current);
    return () => {
      node.removeEventListener("ready", ready);
      node.removeEventListener("canvas-change", change);
      node.removeEventListener("canvas-request", request as EventListener);
      node.removeEventListener("choice", choice);
      node.removeEventListener("cp-load-error", error);
    };
  }, []);

  useLayoutEffect(() => {
    const node = element.current!;
    node.vault = chosenVault as CanvasPanelElement["vault"];
    const attributes = {
      "manifest-id": props.manifestId,
      "canvas-id": props.canvasId,
      width: typeof props.width === "number" ? props.width : undefined,
      height: typeof props.height === "number" ? props.height : undefined,
      preset: props.preset,
      rotation: props.rotation,
      interactive: props.interactive,
      "native-controls": props.nativeControls,
      "choice-id": props.choiceIds?.join(","),
    };
    for (const [name, value] of Object.entries(attributes)) {
      // An uncontrolled canvas retains element-driven navigation.
      if (name === "canvas-id" && value === undefined) continue;
      if (value === undefined) node.removeAttribute(name);
      else if (node.getAttribute(name) !== String(value)) node.setAttribute(name, String(value));
    }
  }, [
    chosenVault,
    props.manifestId,
    props.canvasId,
    props.width,
    props.height,
    props.preset,
    props.rotation,
    props.interactive,
    props.nativeControls,
    props.choiceIds,
  ]);

  return createElement(
    "canvas-panel",
    {
      ref,
      id: props.id,
      className: props.className,
      style: {
        ...props.style,
        "--atlas-container-width": typeof props.width === "string" ? props.width : undefined,
        "--atlas-container-height": typeof props.height === "string" ? props.height : undefined,
      },
    },
    props.children,
  );
});

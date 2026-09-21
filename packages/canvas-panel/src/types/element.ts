import type { Vault } from "@iiif/helpers";
import type { ChoiceDescription } from "@iiif/helpers/painting-annotations";
import type { Selector, Annotation } from "@iiif/parser/presentation-3/types";
import type { AnnotationNormalized } from "@iiif/parser/presentation-3-normalized/types";
import type { BoxStyle, Runtime, easingFunctions } from "@atlas-viewer/atlas/react";
import type { AnnotationDisplay } from "../helpers/annotation-display";
import type { ContentStateEvent, ContentStateCallback } from "./content-state";

export interface CanvasPanelEventMap extends HTMLElementEventMap {
  ready: CustomEvent<void>;
  choice: CustomEvent<{ choice: ChoiceDescription }>;
  "canvas-change": CustomEvent<{ canvas: string | undefined }>;
  "cp-load-error": ErrorEvent;
}

/** Implemented public API. Call methods after the element has connected/whenReady. */
export interface CanvasPanelElement extends HTMLElement {
  vault: Vault;
  readonly ready: boolean;
  whenReady(callback: () => void): void;
  setCanvas(id: string): void;
  setManifest(id: string): void;
  getCanvasId(): string | undefined;
  getManifestId(): string | undefined;
  getDefaultChoiceIds(): string[];
  setDefaultChoiceIds(ids: string[]): void;
  makeChoice(id: string, options?: { deselect?: boolean; deselectOthers?: boolean }): void;
  goHome(immediate?: boolean): void;
  goToTarget(
    target: { x: number; y: number; width: number; height: number },
    options?: { padding?: number; nudge?: boolean; immediate?: boolean },
  ): void;
  zoomIn(point?: { x: number; y: number }): void;
  zoomOut(point?: { x: number; y: number }): void;
  zoomBy(factor: number, point?: { x: number; y: number }): void;
  getZoom(): number | undefined;
  getMaxZoom(): number;
  getMinZoom(): number;
  setRotation(rotation: string | number): void;
  getRotation(): number | undefined;
  setHighlight(highlight: Selector | Selector[] | undefined): void;
  setTarget(target: Selector | Selector[] | undefined): void;
  clearTarget(): void;
  setPreferredFormats(formats: string[]): void;
  getPreferredFormats(): string[];
  setMode(mode: "sketch" | "explore"): void;
  setFps(frames: number): void;
  applyStyles(resource: string | { id: string }, style: BoxStyle): void;
  setClassName(resource: string | { id: string }, className: string): void;
  withAtlas(callback: (runtime: Runtime) => void): void;
  transition(callback: (manager: NonNullable<Runtime["transitionManager"]>) => void): void;
  easingFunctions(): typeof easingFunctions;
  createAnnotationDisplay(source: ConstructorParameters<typeof AnnotationDisplay>[0]): AnnotationDisplay;
  annotations: {
    add(annotation: string | Annotation | AnnotationNormalized | AnnotationDisplay): void;
    remove(annotation: string | Annotation | AnnotationNormalized | AnnotationDisplay): void;
    get(id: string): AnnotationNormalized | null;
    getAll(): AnnotationNormalized[];
  };
  annotationPageManager: {
    availablePageIds: string[];
    enabledPageIds: string[];
    setPageEnabled(id: string): void;
    setPageDisabled(id: string): void;
  };
  getContentState(): Omit<ContentStateEvent, "selection">;
  getPosition(): {
    x: number | undefined;
    y: number | undefined;
    width: number | undefined;
    height: number | undefined;
  };
  enableContentStateSelection(callback: ContentStateCallback): void;
  disableContentStateSelection(): void;
  setContentStateFromText(text: string, immediate?: boolean): void;
  addEventListener<K extends keyof CanvasPanelEventMap>(
    type: K,
    listener: (this: CanvasPanelElement, event: CanvasPanelEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof CanvasPanelEventMap>(
    type: K,
    listener: (this: CanvasPanelElement, event: CanvasPanelEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void;
}

declare global {
  interface HTMLElementTagNameMap {
    "canvas-panel": CanvasPanelElement;
  }
}

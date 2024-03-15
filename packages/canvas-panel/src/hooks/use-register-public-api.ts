import {
  ChoiceBody,
  Annotation,
  AnnotationNormalized,
  CanvasNormalized,
  ManifestNormalized,
  Reference,
  Selector,
} from '@iiif/presentation-3';
import { Vault } from '@iiif/vault';
import { createContext } from 'preact';
import {useContext, useEffect, useRef} from 'preact/compat';
import { AnnotationDisplay } from '../helpers/annotation-display';
import { ParsedSelector } from 'react-iiif-vault';
import { BoxStyle } from '@atlas-viewer/atlas';
import {useLayoutEffect} from "react";

type TBC = any;

type UndefinedVaultHelpers = {
  containsChoice(canvas: TBC): boolean;
  extractChoiceSets(canvas: TBC): TBC;
};

export type UseRegisterPublicApi = {
  properties: {
    // values from docs
    textSelectionEnabled: boolean;
    text: {
      supplementingAnnotations: TBC[];
      text: TBC[];
      html: TBC[];
      selection: {
        supplementingAnnotations: TBC[];
        text: TBC[];
        html: TBC[];
      };
    };

    // Helpers from docs
    setCanvas(canvasId: string): void;
    goHome(immediate?: boolean): void;
    goToTarget(target: TBC, options: TBC): void;
    query(format: TBC): { addEventListener(): void } & TBC;

    // Proposed values
    vault: Vault;

    // Latest additions
    getCanvas(): CanvasNormalized | undefined;
    getCanvasId(): string | undefined;
    getManifest(): ManifestNormalized | undefined;
    getManifestId(): string | undefined;
    getContentState(): object | undefined;
    getPosition(): object | undefined;
    // Proposed helpers
    getDefaultChoiceIds(): string[];
    setDefaultChoiceIds(ids: string[] | ((prev: string[]) => string[])): void;
    enableTextSelection(): void;
    disableTextSelection(): void;
    enableText(): void;
    disableText(): void;
    getTextContent(options?: { html?: boolean; motivation?: string; selected?: boolean }): TBC[];
    setManifest(manifestId: string, opts?: { canvasIndex?: number; canvasId?: string }): void;
    setRenderMode(mode: 'zoom' | 'static' | 'responsive'): void;
    setIIIFContent(content: string | TBC): void;
    getPreferredFormats(): string[];
    setPreferredFormats(formats: string[]): void;
    getTarget(): ParsedSelector | undefined;
    setTarget(region: string | TBC, options?: TBC): void;
    clearTarget(): void;
    getHighlight(): ParsedSelector | undefined;
    setHighlight(newHighlight: Selector | Selector[] | undefined): void;
    // addHighlight(region: string | TBC, options?: TBC): string; // Returns minted annotation id
    // removeHighlight(id: string | AnnotationNormalized): void;

    applyStyles(idOrRef: string | Reference<any>, style: BoxStyle): void;
    setClassName(idOrRef: string | Reference<any>, className: string): void;

    // Unsure about this, but trying to combine these similar terms
    setAnnotationOptions(options: {
      highlighting: {
        cssClass: string;
        visible: boolean;
        selectable: boolean;
      };
      linking: {
        cssClass: string;
        visible: boolean;
        selectable: boolean;
      };
      text: {
        cssClass: string;
        visible: boolean;
        selectable: boolean;
      };
    }): void;

    annotationPageManager: {
      availablePageIds: string[]; // ["https://.../annotation-page"]
      enabledPageIds: string[]; // []
      setPageEnabled(pageId: string): void;
      setPageDisabled(pageId: string): void;
      // setPageStyle(pageId: string, style: TBC): void;
    };

    // An internally controlled annotation page that is visible.
    annotations: {
      add(annotation: string | Annotation | AnnotationDisplay | AnnotationNormalized): void;
      // Proposed.
      getAll(): Array<{
        annotation: AnnotationNormalized;
        meta: TBC;
      }>;
      get(annotationId: string): AnnotationNormalized | null;
      getSource(annotationId: string): string | Annotation | AnnotationDisplay | AnnotationNormalized | null;
      remove(annotation: string | Annotation | AnnotationDisplay | AnnotationNormalized): void;
    };
  };
  attributes: {
    // All of the attributes on the <canvas-panel /> element
    render: 'zoom' | 'static' | 'responsive';
    'canvas-id': string;
    'manifest-id': string;
    'iiif-content': string;
    partof: string; // rename part-of?
    'preferred-formats': string;
    region: string;
    'choice-id': string;
    highlight: string; // x,y,w,h
    'annotation-css-class': string;
    'highlight-css-class': string;
    'link-css-class': string;
    'follow-annotations': 'true' | 'false';
    'text-enabled': 'true' | 'false';
    'text-selection-enabled': 'true' | 'false';

    // HTML extensions / proxy
    id: string;
    alt: string;
    'aria-label': string;
    'aria-labelledby': string;
    role: string;
    title: string;
  };
  customEvents: {
    // All of the custom events dispatched from this component that can be listened to.
    'canvas-choice': {
      choices: ChoiceBody[];
      renderChoice(choice: ChoiceBody | ChoiceBody[], options?: { opacity: number } & TBC): void;
      setOptions(choice: ChoiceBody | ChoiceBody[], options?: { opacity: number } & TBC): void;
    };
  };
};

const emptyCtx: (api: (host: HTMLElement) => Partial<UseRegisterPublicApi['properties']>) => void = () => {
  // no-op
  return () => ({});
};

export const RegisterPublicApi = createContext<
  undefined | ((api: (host: HTMLElement) => Partial<UseRegisterPublicApi['properties']>) => void)
>(emptyCtx);

export function useRegisterPublicApi(
  cb: (host: HTMLElement) => Partial<UseRegisterPublicApi['properties']>,
  cacheKey: any
) {
  const lastCacheKey = useRef();
  const register = useContext(RegisterPublicApi) || emptyCtx;

  // Yes, inline side-effect.
  if (lastCacheKey.current !== cacheKey) {
    register(cb);
  }

  lastCacheKey.current = cacheKey;
}

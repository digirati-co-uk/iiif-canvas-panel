import { ChoiceEventContext } from "../helpers/eventbus";
import { createElement as h, Fragment, useContext, type Context, type ReactNode } from "react";
import {
  ReactVaultContext,
  ResourceReactContext,
  SimpleViewerReactContext,
  VisibleCanvasReactContext,
  ImageServiceLoaderContext,
  ReactEventContext,
  ReactEmitterContext,
  AuthRContext,
} from "react-iiif-vault/core";
import { AtlasContext, BoundsContext, ModeContext } from "@atlas-viewer/atlas/react";
import { RegisterPublicApi } from "../hooks/use-register-public-api";
import { VirtualAnnotationPageContext } from "../hooks/use-virtual-annotation-page-context";

// Fixed, explicit contexts used by our own scene/DOM roots, not host app contexts.
const contexts: Context<any>[] = [
  ReactVaultContext,
  ResourceReactContext,
  SimpleViewerReactContext,
  VisibleCanvasReactContext,
  ImageServiceLoaderContext,
  ReactEventContext,
  ReactEmitterContext,
  AuthRContext,
  RegisterPublicApi,
  VirtualAnnotationPageContext,
  AtlasContext,
  BoundsContext,
  ModeContext,
  ChoiceEventContext,
];
export type ContextValues = any[];
export function useContextValues() {
  return contexts.map((context) => useContext(context));
}
export function ContextBridge({ values, children }: { values: ContextValues; children?: ReactNode }) {
  return h(
    Fragment,
    null,
    contexts.reduceRight(
      (content, context, index) =>
        index < values.length ? h(context.Provider, { value: values[index] }, content) : content,
      children,
    ),
  );
}

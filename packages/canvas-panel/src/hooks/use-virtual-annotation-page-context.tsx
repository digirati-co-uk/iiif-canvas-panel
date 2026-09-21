import { createElement as h, createContext } from 'react';
import { useVirtualAnnotationPage } from './use-virtual-annotation-page';
import { useMemo, useContext } from 'react';
import type { Annotation } from '@iiif/parser/presentation-3/types';
import type { AnnotationNormalized, AnnotationPageNormalized } from '@iiif/parser/presentation-3-normalized/types';
import { VaultActivatedAnnotation } from 'react-iiif-vault/core';

export const VirtualAnnotationPageContext = createContext<{
  fullPage: AnnotationPageNormalized | null;
  addAnnotation: (
    id: string | Annotation | VaultActivatedAnnotation | AnnotationNormalized,
    atIndex?: number | undefined
  ) => void;
  removeAnnotation: (id: string | Annotation | VaultActivatedAnnotation | AnnotationNormalized) => void;
} | null>(null);

export function useVirtualAnnotationPageContext() {
  const ctx = useContext(VirtualAnnotationPageContext);

  return [ctx!.fullPage, { addAnnotation: ctx!.addAnnotation, removeAnnotation: ctx!.removeAnnotation }] as const;
}

export function VirtualAnnotationProvider({ children }: { children: any }) {
  const [fullPage, { addAnnotation, removeAnnotation }] = useVirtualAnnotationPage();

  return (
    <VirtualAnnotationPageContext.Provider
      value={useMemo(() => ({ fullPage, addAnnotation, removeAnnotation } as any), [fullPage])}
    >
      {children}
    </VirtualAnnotationPageContext.Provider>
  );
}

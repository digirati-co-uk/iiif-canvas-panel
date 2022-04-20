import { h, createContext } from 'preact';
import { useVirtualAnnotationPage } from './use-virtual-annotation-page';
import { useMemo, useContext } from 'preact/compat';
import { Annotation, AnnotationNormalized, AnnotationPageNormalized } from '@iiif/presentation-3';
import { VaultActivatedAnnotation } from 'react-iiif-vault';

const VirtualAnnotationPageContext = createContext<{
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
    <VirtualAnnotationPageContext.Provider value={useMemo(() => ({ fullPage, addAnnotation, removeAnnotation }), [fullPage])}>
      {children}
    </VirtualAnnotationPageContext.Provider>
  );
}

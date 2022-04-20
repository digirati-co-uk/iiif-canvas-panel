import { AnnotationPageNormalized } from '@iiif/presentation-3';
import { useStyleHelper, useVault, useVirtualAnnotationPage as useVirtualAnnotationPageBase } from 'react-iiif-vault';
import { useRef, unstable_UserBlockingPriority } from 'preact/compat';
import { useRegisterPublicApi } from './use-register-public-api';
import { BoxStyle } from '@atlas-viewer/atlas';

export function useVirtualAnnotationPage() {
  const [fullPage, { addAnnotation, removeAnnotation }] = useVirtualAnnotationPageBase();
  const vault = useVault();
  const styles = useStyleHelper();
  const sources = useRef<Record<any, any>>([]);
  const virtualId = fullPage?.id;

  useRegisterPublicApi(() => {
    return {
      annotations: {
        add(annotation) {
          addAnnotation(annotation as any);
        },
        get(id) {
          if (virtualId) {
            const page: AnnotationPageNormalized = vault.get({ id: virtualId, type: 'AnnotationPage' });
            const found = (page.items || []).find((item) => item.id === id);
            return found ? vault.get(found) : null;
          }
          return null;
        },
        getSource(id) {
          return sources.current[id] || null;
        },
        getAll() {
          if (virtualId) {
            const page: AnnotationPageNormalized = vault.get({ id: virtualId, type: 'AnnotationPage' });
            return page ? vault.get(page.items) || [] : [];
          }
          return [];
        },
        remove(annotation) {
          removeAnnotation(annotation as any);
        },
        applyStyles(style: BoxStyle) {
          if (virtualId) {
            styles.applyStyles(virtualId, 'atlas', style);
          }
        },
        applyHTMLProperties(
          props: Partial<{
            className?: string;
            href?: string;
            target?: string;
            title?: string;
          }>
        ) {
          if (virtualId) {
            styles.applyStyles(virtualId, 'html', props);
          }
        },
      },
    };
  }, virtualId);

  return [
    fullPage,
    {
      addAnnotation,
      removeAnnotation,
    },
  ] as const;
}

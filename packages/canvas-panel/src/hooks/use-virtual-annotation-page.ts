import { Annotation, AnnotationNormalized, AnnotationPageNormalized } from '@iiif/presentation-3';
import { Vault } from '@iiif/vault';
import { useVault, useVaultSelector } from 'react-iiif-vault';
import { createStylesHelper } from '@iiif/vault-helpers';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'preact/compat';
import { useRegisterPublicApi } from './use-register-public-api';
import { emptyAnnotationPage } from '@iiif/parser';
import { BoxStyle } from '@atlas-viewer/atlas';
import { AnnotationDisplay } from '../helpers/annotation-display';
import { importEntities } from '@iiif/vault/actions';

function createAnnotationPage(page: Partial<AnnotationPageNormalized>): AnnotationPageNormalized {
  return { ...emptyAnnotationPage, ...page };
}

function importEntity(vault: Vault, entity: any) {
  const store = vault.getStore();
  return store.dispatch(
    importEntities({
      entities: {
        Manifest: {},
        Annotation: {},
        AnnotationCollection: {},
        AnnotationPage: {},
        Canvas: {},
        Collection: {},
        ContentResource: {},
        Range: {},
        Selector: {},
        Service: {},
        Agent: {},
        [entity.type]: {
          [entity.id]: entity,
        },
      },
    })
  );
}

export function useVirtualAnnotationPage() {
  const vault = useVault();
  const styles = useMemo(() => createStylesHelper(vault), [vault]);
  const sources = useRef<Record<any, any>>([]);
  const virtualId = useMemo(() => {
    return `vault://annotation-page/${new Date().getTime()}/${Math.round(Math.random() * 1000000000).toString(16)}`;
  }, []);

  useLayoutEffect(() => {
    const page = createAnnotationPage({
      id: virtualId,
      items: [],
    });
    importEntity(vault, page);
  }, [virtualId]);

  const fullPage: AnnotationPageNormalized | null = useVaultSelector(
    (state) => (virtualId ? state.iiif.entities.AnnotationPage[virtualId] : null),
    [virtualId]
  );

  const addAnnotation = useCallback(
    (id: string | Annotation | AnnotationDisplay | AnnotationNormalized) => {
      if (virtualId) {
        if (id instanceof AnnotationDisplay) {
          const display = id;
          if (!display.__vault) {
            // First bind to vault.
            display.bindToVault(vault);
          }
          id = typeof display.source === 'string' ? display.source : display.source.id;
          sources.current[id] = display;
        } else if (typeof id !== 'string') {
          id = id.id;
        }

        const full: AnnotationPageNormalized = vault.get({ id: virtualId, type: 'AnnotationPage' });
        const annotation: AnnotationNormalized = vault.get({ id, type: 'Annotation' });
        if (full && annotation) {
          if (!full.items.find((r: any) => r.id === annotation.id)) {
            vault.modifyEntityField(full, 'items', [...(full.items || []), { id: annotation.id, type: 'Annotation' }]);
          }
        }
      }
    },
    [virtualId]
  );
  const removeAnnotation = useCallback(
    (id: string | Annotation | AnnotationDisplay | AnnotationNormalized) => {
      if (virtualId) {
        if (id instanceof AnnotationDisplay) {
          id = typeof id.source === 'string' ? id.source : id.source.id;
        } else if (typeof id !== 'string') {
          id = id.id;
        }

        if (sources.current[id]) {
          sources.current[id].beforeRemove();
        }

        const full: AnnotationPageNormalized = vault.get({ id: virtualId, type: 'AnnotationPage' });
        if (full) {
          vault.modifyEntityField(
            full,
            'items',
            (full.items || []).filter((t) => t.id !== id)
          );
        }
      }
    },
    [virtualId]
  );

  useRegisterPublicApi(() => {
    return {
      annotations: {
        add(annotation) {
          addAnnotation(annotation as any);
        },
        get(id) {
          const page: AnnotationPageNormalized = vault.get({ id: virtualId, type: 'AnnotationPage' });
          const found = (page.items || []).find((item) => item.id === id);
          return found ? vault.get(found) : null;
        },
        getSource(id) {
          return sources.current[id] || null;
        },
        getAll() {
          const page: AnnotationPageNormalized = vault.get({ id: virtualId, type: 'AnnotationPage' });
          return page ? vault.get(page.items) || [] : [];
        },
        remove(annotation) {
          removeAnnotation(annotation as any);
        },
        applyStyles(props: BoxStyle) {
          styles.applyStyles(virtualId, 'atlas', props);
        },
      },
    };
  }, [virtualId]);

  return [
    fullPage,
    {
      addAnnotation,
      removeAnnotation,
    },
  ] as const;
}

import register from '../library/preact-custom-element';
import { useExistingVault, VaultProvider } from 'react-iiif-vault';
import { useGenericAtlasProps } from '../hooks/use-generic-atlas-props';
import { NestedAtlas } from '../components/NestedAtlas/NestedAtlas';

export function LayoutContainer({ children, ...props }: any) {
  const vault = useExistingVault();
  const { setIsReady, atlasProps, isReady, className } = useGenericAtlasProps(props);

  return (
    <VaultProvider vault={vault}>
      <NestedAtlas
        onCreated={() => {
          setIsReady(true);
        }}
        viewport={true}
        className={className || ''}
        {...atlasProps}
      >
        {isReady ? <slot>{children}</slot> : null}
      </NestedAtlas>
    </VaultProvider>
  );
}

if (typeof window !== 'undefined') {
  const config = {
    shadow: true,
    onConstruct(instance: any) {
      instance._props = {
        __registerPublicApi: (api: any) => {
          Object.assign(instance, api(instance));
        },
      };
    },
  } as any;

  register(LayoutContainer, 'atlas-viewer', [], config);
  register(LayoutContainer, 'layout-container', [], config);
}

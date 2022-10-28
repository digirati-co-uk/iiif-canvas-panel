import { useSyncedState } from '../hooks/use-synced-state';
import { parseBool } from '../helpers/parse-attributes';
import { ManifestContext, useExistingVault, useExternalManifest, VaultProvider } from 'react-iiif-vault';
import { globalVault, Vault } from '@iiif/vault';
import { Fragment, h } from 'preact';
import { RangeDisplay } from '../components/RangeDisplay/RangeDisplay';
import { useLayoutEffect, useRef, useState } from 'preact/compat';
import { RangeNormalized } from '@iiif/presentation-3';
import register from 'preact-custom-element';

export interface RangePanelProps {
  vault?: Vault;
  manifestId: string;
  configId?: string;
  selectedRange?: string;
  canvasId?: string;
  autoScroll?: boolean;
  children?: any;
  onRangeClick?: (range: RangeNormalized, other: any) => void;
  __registerPublicApi?: (api: (host: HTMLElement) => any) => void;
}

export function RangePanel(props: RangePanelProps) {
  const existingVault = useExistingVault();
  const vault = props.vault || existingVault || globalVault();
  const [manifestId] = useSyncedState(props.manifestId);
  const [canvasId] = useSyncedState(props.canvasId);
  const [selectedRange] = useSyncedState(props.selectedRange);
  const [autoScroll] = useSyncedState(props.autoScroll, { parse: parseBool, defaultValue: true });
  const [el, setEl] = useState<HTMLElement>();

  useLayoutEffect(() => {
    if (props.__registerPublicApi) {
      props.__registerPublicApi((element: any) => {
        setEl(element);

        return {};
      });
    }
  }, []);

  if (!manifestId) {
    return <slot name="no-manifest" />;
  }

  function onRangeClick(range: RangeNormalized, other: any) {
    if (el) {
      el.dispatchEvent(
        new CustomEvent('range-change', {
          detail: {
            range,
            isLeaf: other.isLeaf,
            canvasId: other.canvasId,
            fragment: other.fragment,
            selector: other.selector,
            parsedSelector: other.parsedSelector,
          },
        })
      );
    }
  }

  return (
    <Fragment>
      <VaultProvider vault={vault}>
        <ManifestRanges
          manifestId={manifestId}
          canvasId={canvasId}
          selectedRange={selectedRange}
          autoScroll={autoScroll}
          onRangeClick={onRangeClick}
        />
      </VaultProvider>
    </Fragment>
  );
}

function ManifestRanges(props: RangePanelProps) {
  const { manifest, isLoaded } = useExternalManifest(props.manifestId);

  if (!manifest || !isLoaded) {
    return null;
  }

  return (
    <ManifestContext manifest={manifest.id}>
      <RangeDisplay {...props} />
    </ManifestContext>
  );
}

const rangePanelProps = ['manifest-id', 'config-id', 'canvas-id', 'auto-scroll', 'selected-range'];

if (typeof window !== 'undefined') {
  register(RangePanel, 'range-panel', rangePanelProps, {
    shadow: false,
    onConstruct(instance: any) {
      Object.defineProperty(instance, 'vault', {
        get(): any {
          return instance._props.vault;
        },
        set(v): any {
          instance._props.vault = v;
        },
      });
      instance._props = {
        __registerPublicApi: (api: any) => {
          Object.assign(instance, api(instance));
        },
      };
    },
  } as any);
}
